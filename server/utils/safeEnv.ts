const redact = (value?: string | null) => {
  if (!value) return undefined;
  return '[REDACTED]';
};

export function safeEnv() {
  const snapshot: Record<string, string | undefined> = {};
  const source = process.env ?? {};

  for (const [key, value] of Object.entries(source)) {
    if (key === 'OPENAI_API_KEY' || key === 'SYSTEM_PROMPT') {
      snapshot[key] = redact(value);
      continue;
    }
    snapshot[key] = value;
  }

  return snapshot;
}
