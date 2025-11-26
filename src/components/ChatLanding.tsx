import { Mic, PanelRightOpen, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { FC, KeyboardEvent } from 'react';
import type { ThemeMode } from '../types';

interface ChatLandingProps {
  theme: ThemeMode;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  focusSignal?: number;
  onOpenPanel: () => void;
}

export const ChatLanding: FC<ChatLandingProps> = ({
  theme,
  value,
  onChange,
  onSubmit,
  onFocus,
  focusSignal,
  onOpenPanel
}) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isDark = theme === 'dark';
  const focusShadowClass = isDark
    ? 'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--foreground)_08%,transparent)]'
    : 'focus-within:shadow-[inset_0_0_12px_rgba(15,23,42,0.08)]';

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!value.trim()) return;
      onSubmit();
    }
  };

  useEffect(() => {
    if (!focusSignal) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    const length = input.value.length;
    input.setSelectionRange(length, length);
  }, [focusSignal]);

  const inputWrapperClasses = [
    'group relative flex w-full items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-card px-4 py-3 text-foreground shadow-inner transition-[box-shadow,border-color,background-color] duration-200',
    'focus-within:border-[var(--border)] focus-within:ring-1 focus-within:ring-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--border)]',
    'dark:border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] dark:bg-[var(--background)]',
    'dark:focus-within:border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] dark:focus-within:ring-[color-mix(in_srgb,var(--foreground)_20%,transparent)] dark:focus-visible:ring-[color-mix(in_srgb,var(--foreground)_20%,transparent)]',
    focusShadowClass
  ]
    .filter(Boolean)
    .join(' ');

  const chipBaseClasses =
    'mt-4 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';
  const chipThemeClasses = 'bg-card text-foreground hover:bg-[var(--muted)]';

  const iconButtonClasses =
    'rounded-full p-2 text-foreground/70 transition hover:bg-[var(--muted)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  const sendButtonClasses =
    'rounded-md p-2 text-foreground/80 transition hover:bg-[var(--muted)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  const handleSendClick = () => {
    if (!value.trim()) return;
    onSubmit();
  };

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-center'>
      <div className='flex flex-col items-center gap-4'>
        <div className='mx-auto flex flex-col items-center font-sans gap-3'>
          <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-card shadow-md transition-all duration-300'>
            <img
              src='/assets/logo.svg'
              alt='Logo Ia Engine'
              className='h-16 w-16 rounded-full object-cover shadow-md'
              aria-hidden='false'
            />
          </div>
          <div className='flex flex-col items-center text-center gap-2'>
            <h1 className='font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl mt-0 mb-0'>
              AI Engine | Prompt Engineer
            </h1>
            <p className='text-sm text-foreground/70 mt-0 mb-0'>
              Comece descrevendo seu produto/ideia, ou use o painel de criação.
            </p>
            <div className='mt-0 w-full max-w-xl'>
              <label className='sr-only' htmlFor='landing-chat-input'>
                Campo de pergunta
              </label>
              <div className='flex items-center gap-2 rounded-2xl bg-zinc-100 border border-zinc-300 text-zinc-900 dark:bg-zinc-900/80 dark:border-zinc-700/60 dark:text-zinc-100 px-4 py-2 focus-within:border-zinc-400 focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.04)] dark:focus-within:border-zinc-600 dark:focus-within:shadow-[0_0_0_2px_rgba(255,255,255,0.08)] transition-shadow transition-colors duration-150'>
                <textarea
                  id='landing-chat-input'
                  aria-label='Campo de pergunta'
                  ref={inputRef}
                  className='flex-1 h-12 bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus:border-transparent focus-visible:border-transparent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none appearance-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 resize-none whitespace-pre-wrap break-words overflow-y-auto py-3'
                  placeholder='Descreva seu produto ou sua ideia...'
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => onFocus?.()}
                />

                <button
                  type='button'
                  className='p-2 rounded-full text-zinc-900 hover:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-colors'
                  aria-label='Ativar microfone'
                >
                  <Mic className='h-4 w-4 text-zinc-900 dark:text-zinc-300' aria-hidden='true' />
                </button>
                <button
                  type='button'
                  onClick={handleSendClick}
                  className='p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors'
                  aria-label='Enviar mensagem'
                >
                  <Send className='h-4 w-4 text-zinc-700 dark:text-zinc-300' aria-hidden='true' />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-[820px] space-y-0 mt-0'>
          <button
            type='button'
            className={`${chipBaseClasses} ${chipThemeClasses}`}
            onClick={onOpenPanel}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onOpenPanel();
              }
            }}
          >
            <PanelRightOpen className='h-4 w-4 opacity-80' aria-hidden='true' />
            Ir para Painel de Criação
          </button>
        </div>
      </div>
    </div>
  );
};
