const isServerRuntime = typeof window === 'undefined';

export type SystemDiag = {
  enabled: boolean;
  model: string;
  hasSystem: boolean;
  isFirstSystem: boolean;
  systemLen: number;
  systemPrefix: string;
  fromEnv: boolean;
  suspectEnvTrunc: boolean;
};

declare const process: { env?: Record<string, string | undefined> } | undefined;

export function getSystemFromEnv(): string | null {
  return process?.env?.SYSTEM_PROMPT ?? null;
}

export function buildSystem(systemFromEnv?: string | null, fallbackFile?: string) {
  const trimmedEnv = typeof systemFromEnv === 'string' && systemFromEnv.trim().length > 0 ? systemFromEnv : null;
  const system = trimmedEnv ?? (fallbackFile ?? '');
  const suspectEnvTrunc =
    !!trimmedEnv &&
    trimmedEnv.includes('\\n') === false &&
    trimmedEnv.split('\n').length === 1 &&
    trimmedEnv.length < 300;
  return { system, suspectEnvTrunc, fromEnv: !!trimmedEnv };
}

export function logSystemDiag(d: SystemDiag) {
  if (!isServerRuntime || !d.enabled) return;
  console.info('[SYSTEM][Diag]', {
    model: d.model,
    hasSystem: d.hasSystem,
    isFirstSystem: d.isFirstSystem,
    systemLen: d.systemLen,
    prefix: d.systemPrefix,
    fromEnv: d.fromEnv,
    suspectEnvTrunc: d.suspectEnvTrunc
  });
  if (d.suspectEnvTrunc) {
    console.warn(
      '[SYSTEM][Warn] ENV possivelmente truncada. Prefira arquivo privado (ex.: server/prompts/system.private.ts) ou use \\n para quebras.'
    );
  }
  const weak = ['gpt-3.5', 'mini', 'small'].some((k) => d.model?.toLowerCase().includes(k));
  if (weak) {
    console.warn('[SYSTEM][Hint] Modelo pode ignorar system extenso. Sugestão: gpt-4o / gpt-4-turbo ou equivalente.');
  }
}
