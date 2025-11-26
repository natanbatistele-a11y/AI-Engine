import type { FC } from 'react';
import type { Message, ThemeMode } from '../types';
import { ChatComposer } from './ChatComposer';
import { ChatLanding } from './ChatLanding';
import { MessageBubble } from './MessageBubble';

export interface ChatAreaProps {
  theme: ThemeMode;
  messages: Message[];
  composerValue: string;
  onComposerChange: (value: string) => void;
  onSubmitMessage: () => void;
  onCopyMessage: (message: Message) => void;
  copiedMessageId: string | null;
  onComposerFocus?: () => void;
  focusSignal?: number;
  chatId?: string;
  onOpenPanel: () => void;
  canRetryLastMessage?: boolean;
  onRetryLastMessage?: () => void;
  composerDisabled?: boolean;
}

// Diagnostico: no dark o combo `bg-white` + `shadow-[0_10px_30px...]` deixava um cartao claro, enquanto no light
// o `border border-neutral-200` criava linha; agora alinhamos fundo/borda ao tema e removemos sombra no dark.
export const ChatArea: FC<ChatAreaProps> = ({
  theme,
  messages,
  composerValue,
  onComposerChange,
  onSubmitMessage,
  onCopyMessage,
  copiedMessageId,
  onComposerFocus,
  focusSignal,
  chatId,
  onOpenPanel,
  canRetryLastMessage,
  onRetryLastMessage,
  composerDisabled
}) => {
  const showLanding = messages.length === 0;

  return (
    <section className="flex w-full flex-1 flex-col gap-6" data-chat-id={chatId}>
      {showLanding ? (
        <div className="flex flex-1 flex-col">
          <ChatLanding
            theme={theme}
            value={composerValue}
            onChange={onComposerChange}
            onSubmit={onSubmitMessage}
            onFocus={onComposerFocus}
            focusSignal={focusSignal}
            onOpenPanel={onOpenPanel}
          />
        </div>
      ) : (
        <>
          <div
            className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1"
            role="list"
            aria-label="Historico de conversas"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div key={message.id} className="w-full" role="listitem">
                <MessageBubble
                  message={message}
                  isCopied={copiedMessageId === message.id}
                  onCopy={onCopyMessage}
                  theme={theme}
                />
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3">
            <ChatComposer
              theme={theme}
              value={composerValue}
              onChange={onComposerChange}
              onSubmit={onSubmitMessage}
              onFocus={onComposerFocus}
              focusSignal={focusSignal}
              canRetry={canRetryLastMessage}
              onRetry={onRetryLastMessage}
              disabled={composerDisabled}
            />
          </div>
        </>
      )}
    </section>
  );
};
