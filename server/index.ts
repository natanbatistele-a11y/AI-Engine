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
import { env } from './env';
import { chatRequestSchema } from './schemas';
import { createSession, destroySession, getSession, SESSION_TTL_MS } from './sessionStore';

const PORT = env.PORT;
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const DEBUG_ENABLED = process.env.SYSTEM_DEBUG === 'true' && NODE_ENV !== 'production';
const FALLBACK_FILE_ENV = env.SYSTEM_PROMPT_FILE;
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
const APP_ACCESS_PASSWORD = env.APP_ACCESS_PASSWORD;
const APP_SESSION_SECRET = env.APP_SESSION_SECRET;
const SESSION_COOKIE_NAME = 'session_id';

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
});

if (DEBUG_ENABLED && NODE_ENV !== 'production') {
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

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

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
  path: '/',
  maxAge: SESSION_TTL_MS
};

const issueSession = (res: Response) => {
  const session = createSession();
  res.cookie(SESSION_COOKIE_NAME, session.id, sessionCookieOptions);
  return session;
};

const requireSession: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.signedCookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const session = getSession(sessionToken);
  if (!session) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  (req as Request & { session?: typeof session }).session = session;
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
    console.warn('[SYSTEM] Nao foi possivel carregar o arquivo definido em SYSTEM_PROMPT_FILE.', error);
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

app.post('/api/login', loginLimiter, (req: Request, res: Response) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!password) {
    res.status(400).json({ error: 'missing_password' });
    return;
  }
  if (password !== APP_ACCESS_PASSWORD) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }
  issueSession(res);
  res.json({ ok: true });
});

app.post('/api/auth/login', loginLimiter, (req: Request, res: Response) => {
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

  if (!password) {
    res.status(400).json({ error: 'missing_password' });
    return;
  }

  if (password !== APP_ACCESS_PASSWORD) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  issueSession(res);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const sessionId = req.signedCookies?.[SESSION_COOKIE_NAME] as string | undefined;
  destroySession(sessionId);
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/', signed: true });
  res.json({ ok: true });
});

app.get('/api/session', (req: Request, res: Response) => {
  const token = req.signedCookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const session = getSession(token);
  if (session) {
    res.json({ authenticated: true });
    return;
  }
  res.json({ authenticated: false });
});

app.use('/api/chat', requireSession, chatLimiter);

app.post('/api/chat', async (req: Request<unknown, unknown, ChatRequestBody>, res: Response) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.format() });
  }

  const userMessages = sanitizeMessages(parsed.data.messages);
  const requestedModel = parsed.data.model;
  const resolved = resolveModel(requestedModel);

  if ('error' in resolved) {
    return res.status(422).json({ error: 'unsupported_model', requested: resolved.requested });
  }

  const { model: resolvedModel, aliasUsed } = resolved;

  const { system, suspectEnvTrunc, fromEnv } = await resolveSystemPrompt();
  if (suspectEnvTrunc) {
    console.warn('[SYSTEM] ENV curta; usando fallback privado configurado no servidor.');
  }

  const messagesFinal: ChatCompletionMessageParam[] = [{ role: 'system', content: system }, ...userMessages];

  if (DEBUG_ENABLED) {
    logDiagnostics(messagesFinal, resolvedModel, fromEnv);
    console.info('[MODEL][Requested]:', requestedModel ?? '(default)');
    console.info('[MODEL][Resolved ]:', resolvedModel, aliasUsed ? `(alias ${aliasUsed})` : '');
  }

  let completion: AsyncIterable<ChatCompletionChunk>;

  try {
    completion = await openai.chat.completions.create({
      model: resolvedModel,
      messages: messagesFinal,
      stream: true
    });
  } catch (error) {
    console.error('OpenAI error', error);
    return res.status(502).json({
      error: 'upstream_error',
      message: 'Falha ao gerar resposta. Tente novamente.'
    });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

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
      res.status(502).json({ error: 'upstream_error', message: 'Falha ao gerar resposta. Tente novamente.' });
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