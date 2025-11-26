const HEALTH_ENDPOINT =
  typeof import.meta.env.VITE_HEALTH_URL === 'string' && import.meta.env.VITE_HEALTH_URL.trim().length > 0
    ? import.meta.env.VITE_HEALTH_URL.trim()
    : '/api/health';

export interface HealthCheckResult {
  ok: boolean;
  status: number;
}

export const checkHealth = async (): Promise<HealthCheckResult> => {
  try {
    const response = await fetch(HEALTH_ENDPOINT);
    const payload = await response.json().catch(() => null);
    const remoteOk = typeof payload?.status === 'string' ? payload.status.toLowerCase() === 'ok' : false;
    return {
      ok: response.ok && remoteOk,
      status: response.status
    };
  } catch {
    return {
      ok: false,
      status: 0
    };
  }
};
