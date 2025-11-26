const REDACT_PATTERN = /(key|token|secret|password|pass|api)/i;

const redact = (value?: string | null) => {
  if (!value) return undefined;
  return '[REDACTED]';
};

export function getSafeEnvSnapshot(env: NodeJS.ProcessEnv) {
  const snapshot: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env ?? {})) {
    if (REDACT_PATTERN.test(key)) {
      snapshot[key] = redact(value);
      continue;
    }
    snapshot[key] = value;
  }
  return snapshot;
}

export function safeEnv() {
  return getSafeEnvSnapshot(process.env);
}