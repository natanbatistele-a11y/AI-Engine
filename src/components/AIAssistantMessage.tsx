import { useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';

type Props = {
  content: string;
};

export default function AIAssistantMessage({ content }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API indisponivel: falha silenciosa
    }
  };

  return (
    <div
      className="group relative w-full rounded-xl border-none bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)] p-4 font-mono text-sm text-foreground shadow-none dark:bg-[color-mix(in_srgb,var(--card)_88%,black_12%)]"
      aria-label="Resposta da IA em formato de bloco"
    >
      <pre className="whitespace-pre-wrap break-words leading-relaxed">{content}</pre>

      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--card),#000000_35%)] px-2 py-1 text-xs text-foreground/80 opacity-0 transition hover:bg-[color-mix(in_srgb,var(--card),#000000_55%)] hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
        aria-label={copied ? 'Copiado' : 'Copiar conteudo'}
        title={copied ? 'Copiado' : 'Copiar'}
        type="button"
      >
        {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
