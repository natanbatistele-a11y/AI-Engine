import crypto from 'node:crypto';

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

type Session = {
  id: string;
  createdAt: number;
  expiresAt: number;
};

const sessions = new Map<string, Session>();

const isExpired = (session: Session) => session.expiresAt <= Date.now();

export const createSession = (): Session => {
  const id = crypto.randomUUID();
  const now = Date.now();
  const session: Session = {
    id,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  };
  sessions.set(id, session);
  return session;
};

export const getSession = (id: string | null | undefined): Session | null => {
  if (!id) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (isExpired(session)) {
    sessions.delete(id);
    return null;
  }
  return session;
};

export const destroySession = (id: string | null | undefined) => {
  if (!id) return;
  sessions.delete(id);
};