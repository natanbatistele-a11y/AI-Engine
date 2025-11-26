import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { FC, KeyboardEvent } from 'react';
import type { ThemeMode } from '../types';

interface ChatComposerProps {
  theme: ThemeMode;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  onFocus?: () => void;
  focusSignal?: number;
  canRetry?: boolean;
  onRetry?: () => void;
}

export const ChatComposer: FC<ChatComposerProps> = ({
  theme,
  value,
  onChange,
  onSubmit,
  placeholder = 'Digite sua ideia...',
  disabled,
  onFocus,
  focusSignal,
  canRetry,
  onRetry
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const maxHeight = 160;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!value.trim() || disabled) return;
      onSubmit();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    if (textarea.scrollHeight > maxHeight) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [value]);

  useEffect(() => {
    if (!focusSignal) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus({ preventScroll: true });
    const length = textarea.value.length;
    textarea.setSelectionRange(length, length);
  }, [focusSignal]);

  // Diagnostico: o `border-neutral-200` do light e `border-white/12` no dark criavam linha entorno do input;
  // aplicamos os tokens para alinhar borda/fundo aos tons do chat.
  const containerClasses = [
    'flex w-full items-center gap-3 rounded-xl bg-[color-mix(in_srgb,var(--muted)_85%,transparent)] px-3 py-2 text-foreground shadow-none transition-colors duration-200 focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--border)_60%,transparent)]'
  ].join(' ');

  const textareaClasses =
    'flex-1 min-w-0 rounded-xl border-none bg-transparent px-3 py-2 text-[0.95rem] leading-[1.4rem] text-foreground placeholder:text-foreground/60 transition-all duration-150 focus:outline-none focus-visible:ring-0 resize-none whitespace-pre-wrap break-words overflow-y-auto max-h-40';

  return (
    <div className={containerClasses}>
      <label className="sr-only" htmlFor="chat-composer">
        Area de composicao
      </label>
      <textarea
        id="chat-composer"
        aria-label="Digite sua mensagem"
        ref={textareaRef}
        className={textareaClasses}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        disabled={disabled}
      />
      {canRetry && onRetry && (
        <button
          type="button"
          className="flex-none self-center inline-flex items-center rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20 focus-visible:ring-2 focus-visible:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onRetry}
          disabled={disabled}
        >
          Tentar novamente
        </button>
      )}
      <button
        type="button"
        className="flex-none self-center inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white shadow-none transition hover:bg-[#2563eb] focus-visible:ring-2 focus-visible:ring-blue-400/60 disabled:cursor-not-allowed disabled:bg-blue-300"
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
      >
        Enviar
        <SendHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
