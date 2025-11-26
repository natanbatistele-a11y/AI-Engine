import type { Message } from '../types';

/*
Auditoria 2025-11-07:
- O front decide o placeholder inicial em `src/App.tsx` (composeResponse + handleSendMessage) mas o texto final vem apenas deste fetch.
- O fetch do chat acontece aqui em `src/services/chatProvider.ts`, sempre apontando para `/api/chat` (fallback de `VITE_CHAT_API_URL`).
- O backend local real mora em `server/index.ts` e injeta `{ role: "system" }` antes de chamar a OpenAI com `OPENAI_API_KEY`.
- O system oficial fornecido pelo cliente vive apenas no backend (`server/prompts/system.private.ts`) e nunca e exposto no frontend.
- Vite jo proxia `/api` para `http://localhost:3001`, entuo nuo ho chamadas externas por padruo.
- Logs em dev (`VITE_SYSTEM_DEBUG=true`) mostram somente as roles disparadas pelo navegador para facilitar QA sem duplicar o system.
*/

type ConversationMessage = Pick<Message, 'role' | 'content'>;

export interface ProviderRequestPayload {
  userMessages: ConversationMessage[];
  modelId?: string;
}

type StreamCallback = (delta: string) => void;
type ChatFetchError = Error & {
  status?: number;
  detail?: string;
  warning?: string;
  aliasUsed?: string;
  resolvedModel?: string;
};

const devLogEnabled = import.meta.env.DEV && import.meta.env.VITE_SYSTEM_DEBUG === 'true';
const CHAT_ENDPOINT =
  typeof import.meta.env.VITE_CHAT_API_URL === 'string' && import.meta.env.VITE_CHAT_API_URL.trim().length > 0
    ? import.meta.env.VITE_CHAT_API_URL.trim()
    : '/api/chat';

const sanitizeConversation = (conversation: Message[]): ConversationMessage[] =>
  conversation
    .filter(Boolean)
    .map(({ role, content }) => ({ role, content }))
    .filter((item): item is ConversationMessage => item.role === 'user' || item.role === 'assistant');

export const prepareProviderRequest = (conversation: Message[], modelId?: string): ProviderRequestPayload => {
  const userMessages = sanitizeConversation(conversation);
  if (devLogEnabled) {
    console.info('[chat][client] roles ->', userMessages.map((message) => message.role));
  }
  return {
    userMessages,
    modelId
  };
};

const parseSseEvents = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onDelta?: StreamCallback
): Promise<string | null> => {
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);

      if (rawEvent.startsWith('data:')) {
        const dataPayload = rawEvent.replace(/^data:\s*/, '');
        if (dataPayload === '[DONE]') {
          reader.releaseLock();
          return fullText || null;
        }

        if (dataPayload.length > 0) {
          try {
            const parsed = JSON.parse(dataPayload);
            const delta = typeof parsed?.content === 'string' ? parsed.content : '';
            if (delta) {
              fullText += delta;
              onDelta?.(delta);
            }
          } catch {
            // Ignora pacotes mal-formados.
          }
        }
      }

      boundary = buffer.indexOf('\n\n');
    }
  }

  return fullText || null;
};

const parseJsonResponse = async (response: Response, onDelta?: StreamCallback): Promise<string | null> => {
  const payload = await response.json().catch(() => null);
  const text = typeof payload?.text === 'string' ? payload.text : typeof payload?.message === 'string' ? payload.message : null;
  if (text) {
    onDelta?.(text);
  }
  return text;
};

export const requestProviderCompletion = async (
  payload: ProviderRequestPayload,
  onDelta?: StreamCallback
): Promise<string | null> => {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      messages: payload.userMessages,
      model: payload.modelId
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === 'string' ? body.detail : body?.error;
    const error = new Error(detail ?? `Chat endpoint returned ${response.status}`) as ChatFetchError;
    error.status = response.status;
    error.detail = detail;
    if (typeof body?.warning === 'string') {
      error.warning = body.warning;
    }
    if (typeof body?.aliasUsed === 'string') {
      error.aliasUsed = body.aliasUsed;
    }
    if (typeof body?.resolvedModel === 'string') {
      error.resolvedModel = body.resolvedModel;
    }
    throw error;
  }

  if (!response.body) {
    return parseJsonResponse(response, onDelta);
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/event-stream')) {
    return parseJsonResponse(response, onDelta);
  }

  const reader = response.body.getReader();
  return parseSseEvents(reader, onDelta);
};