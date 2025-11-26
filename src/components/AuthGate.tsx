import { FormEvent, useState } from "react";
import Logo from "./Logo";

type AuthGateProps = {
  onAuthenticated: () => void;
  isCheckingSession?: boolean;
};

export function AuthGate({ onAuthenticated, isCheckingSession = false }: AuthGateProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!password || loading || isCheckingSession) return;

    setLoading(true);
    setError(null);

    try {
      // console.log("[LOGIN] payload enviado:", { username: email, password });
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: email, password }),
      });

      const data = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      // console.log("[LOGIN] resposta:", data);

      if (response.ok && data?.ok) {
        onAuthenticated();
        return;
      }

      if (response.status === 401 || data?.ok === false) {
        setError(data?.message ?? "Credenciais inválidas. Verifique usuario e senha.");
        return;
      }

      setError("Nao foi possivel entrar. Tente novamente em instantes.");
    } catch (err) {
      console.error("[auth] erro ao tentar login", err);
      setError("Nao foi possivel entrar. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || isCheckingSession;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white px-10 py-12 shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo size={92} />
          <h1 className="text-3xl font-semibold text-slate-900">Engine AI</h1>
        </div>

        <form className="mt-8 flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2 w-full">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">
              Usuario
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isBusy}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/25 disabled:cursor-not-allowed disabled:opacity-70"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2 w-full">
            <label className="text-sm font-semibold text-slate-700" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isBusy}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/25 disabled:cursor-not-allowed disabled:opacity-70"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}
          {isCheckingSession && !error && <p className="text-xs text-slate-500">Verificando sessao atual...</p>}

          <button
            type="submit"
            disabled={isBusy}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007bff]/40 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: "#007bff" }}
          >
            Acessar
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthGate;
