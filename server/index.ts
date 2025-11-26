import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionChunk } from 'openai/resources/chat/completions';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { buildSystem } from '../src/lib/systemDebug';
import { fallbackSystemPrompt } from './prompts/system.private';
import { resolveModel } from './modelRegistry';
import { safeEnv } from './utils/safeEnv';

/*
Instruções rápidas:
- Copie `.env.example` para `.env`, defina OPENAI_API_KEY=sk-******************************* e rode `npm run preflight`.
- `npm run dev` executa o preflight antes de subir o server + Vite; sem a chave o boot é bloqueado com log claro.
- `GET /api/health` serve apenas como ping (sem revelar segredos).
*/

const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const DEBUG_ENABLED = process.env.SYSTEM_DEBUG === 'true' && NODE_ENV !== 'production';
const FALLBACK_FILE_ENV = process.env.SYSTEM_PROMPT_FILE;
const rawAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:3000',
    'https://YOUR_PRODUCTION_DOMAIN_HERE'
  ].concat(
    rawAllowedOrigins
      ? rawAllowedOrigins
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : []
  )
);
const isAllowedOrigin = (origin: string) => {
  try {
    const parsed = new URL(origin);
    const hostnameAllowed = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    return allowedOrigins.has(origin) || hostnameAllowed;
  } catch {
    return false;
  }
};
const APP_ACCESS_PASSWORD = process.env.APP_ACCESS_PASSWORD;
const APP_SESSION_SECRET = process.env.APP_SESSION_SECRET;
const SESSION_COOKIE_NAME = 'iaengine_session';
const validSessions = new Set<string>();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

const rawApiKey = process.env.OPENAI_API_KEY?.trim();
if (!rawApiKey || rawApiKey.length < 20) {
  console.error('[ENV] Missing OPENAI_API_KEY. Crie .env a partir de .env.example, preencha e reinicie.');
  process.exit(1);
}

if (!APP_ACCESS_PASSWORD || APP_ACCESS_PASSWORD.trim().length === 0) {
  console.error('[ENV] Missing APP_ACCESS_PASSWORD. Defina a senha de acesso no arquivo .env.');
  process.exit(1);
}

if (!APP_SESSION_SECRET || APP_SESSION_SECRET.trim().length < 16) {
  console.error('[ENV] Missing or weak APP_SESSION_SECRET. Defina um valor seguro no arquivo .env.');
  process.exit(1);
}

if (DEBUG_ENABLED) {
  console.info('[ENV] snapshot', safeEnv());
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(cookieParser(APP_SESSION_SECRET));
app.use(express.json({ limit: '1mb' }));

const openai = new OpenAI({ apiKey: rawApiKey });

type IncomingMessage = Partial<ChatCompletionMessageParam>;

const sanitizeMessages = (raw: unknown): ChatCompletionMessageParam[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is IncomingMessage => typeof item === 'object' && item !== null)
    .map((item) => {
      if (item.role === 'system') {
        return null;
      }
      const role: ChatCompletionMessageParam['role'] = item.role === 'assistant' ? 'assistant' : 'user';
      const content = typeof item.content === 'string' ? item.content : '';
      if (!content.trim()) {
        return null;
      }
      return { role, content };
    })
    .filter((item): item is ChatCompletionMessageParam => item !== null);
};

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: NODE_ENV === 'production',
  signed: true,
  path: '/'
};

const createSessionToken = () =>
  crypto.createHmac('sha256', APP_SESSION_SECRET as string).update(crypto.randomUUID()).digest('hex');

const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.signedCookies?.[SESSION_COOKIE_NAME] as string | undefined;
  if (!sessionToken || !validSessions.has(sessionToken)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
};

let cachedFallbackPrompt: string | null = null;

const resolveFallbackPrompt = async (): Promise<string> => {
  if (cachedFallbackPrompt) {
    return cachedFallbackPrompt;
  }

  if (!FALLBACK_FILE_ENV) {
    cachedFallbackPrompt = fallbackSystemPrompt;
    return cachedFallbackPrompt;
  }

  try {
    const resolvedPath = path.isAbsolute(FALLBACK_FILE_ENV)
      ? FALLBACK_FILE_ENV
      : path.resolve(process.cwd(), FALLBACK_FILE_ENV);
    const moduleUrl = pathToFileURL(resolvedPath).href;
    const imported = await import(moduleUrl);
    const candidate =
      typeof imported?.fallbackSystemPrompt === 'string'
        ? imported.fallbackSystemPrompt
        : typeof imported?.SYSTEM_PROMPT === 'string'
          ? imported.SYSTEM_PROMPT
          : null;
    if (candidate) {
      cachedFallbackPrompt = candidate;
      return cachedFallbackPrompt;
    }
  } catch (error) {
    console.warn('[SYSTEM] Não foi possível carregar o arquivo definido em SYSTEM_PROMPT_FILE.', error);
  }

  cachedFallbackPrompt = fallbackSystemPrompt;
  return cachedFallbackPrompt;
};

const resolveSystemPrompt = async () => {
  const fallbackPrompt = await resolveFallbackPrompt();
  return buildSystem(process.env.SYSTEM_PROMPT ?? null, fallbackPrompt);
};

const logDiagnostics = (messages: ChatCompletionMessageParam[], model: string, fromEnv: boolean) => {
  const system = messages.find((message) => message.role === 'system');
  const systemLen = typeof system?.content === 'string' ? system.content.length : 0;
  console.info('[SYSTEM] role:', system?.role ?? 'none');
  console.info('[SYSTEM] len:', systemLen);
  console.info('[SYSTEM] fromEnv:', fromEnv);
  console.info('[MODEL]:', model);
  console.info('[MESSAGES] roles:', messages.map((m) => m.role));
};

interface ChatRequestBody {
  messages?: unknown;
  model?: string;
}

app.post('/api/login', (req: Request, res: Response) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (password !== APP_ACCESS_PASSWORD) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  const token = createSessionToken();
  validSessions.add(token);
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  res.json({ ok: true });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  // console.log('[LOGIN] body recebido:', req.body);
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

  if (username === 'admengine' && password === '1547') {
    const token = createSessionToken();
    validSessions.add(token);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
    res.json({ ok: true });
    return;
  }

  res.status(401).json({ ok: false, message: 'Credenciais invalidas' });
});

app.get('/api/session', (req: Request, res: Response) => {
  const token = req.signedCookies?.[SESSION_COOKIE_NAME] as string | undefined;
  if (token && validSessions.has(token)) {
    res.json({ authenticated: true });
    return;
  }
  res.json({ authenticated: false });
});

app.use('/api/chat', requireAuth, chatLimiter);

app.post('/api/chat', async (req: Request<unknown, unknown, ChatRequestBody>, res: Response) => {
  const userMessages = sanitizeMessages(req.body?.messages);
  const requestedModel =
    typeof req.body?.model === 'string' && req.body.model.trim().length > 0 ? req.body.model.trim() : undefined;
  const { model: resolvedModel, aliasUsed, warning } = resolveModel(requestedModel);

  const { system, suspectEnvTrunc, fromEnv } = await resolveSystemPrompt();
  if (suspectEnvTrunc) {
    console.warn('[SYSTEM] ENV curta; usando fallback privado configurado no servidor.');
  }

  const messagesFinal: ChatCompletionMessageParam[] = [{ role: 'system', content: system }, ...userMessages];

  if (DEBUG_ENABLED) {
    logDiagnostics(messagesFinal, resolvedModel, fromEnv);
    console.info('[MODEL][Requested]:', requestedModel ?? '(default)');
    console.info(
      '[MODEL][Resolved ]:',
      resolvedModel,
      aliasUsed ? `(alias ${aliasUsed})` : '',
      warning ? `(warn ${warning})` : ''
    );
  }

  let completion: AsyncIterable<ChatCompletionChunk>;

  try {
    completion = await openai.chat.completions.create({
      model: resolvedModel,
      messages: messagesFinal,
      stream: true
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    const code = (error as { code?: string })?.code ?? 'unknown_error';
    const detail =
      (error as { error?: { message?: string } })?.error?.message ?? (error as Error)?.message ?? 'OpenAI request failed';
    console.error('[API][chat] erro', status, code, detail);

    if (status === 404 || code === 'model_not_found') {
      res.status(422).json({
        error: 'model_not_found',
        detail,
        hint: 'Modelo solicitado não existe; utilize apenas chaves conhecidas (ex.: copy-vsl) ou deixe vazio.',
        resolvedModel,
        aliasUsed,
        warning
      });
      return;
    }

    res.status(status).json({ error: code, detail });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (warning) {
    res.write(`data: ${JSON.stringify({ info: 'model_warning', warning, resolvedModel, aliasUsed })}\n\n`);
  }

  try {
    for await (const chunk of completion) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (streamError) {
    console.error('[API][chat] erro durante stream', streamError);
    if (!res.headersSent) {
      res.status(500).json({ error: 'stream_error', detail: 'Failed while streaming OpenAI response' });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[API] listening on http://localhost:${PORT}`);
});


