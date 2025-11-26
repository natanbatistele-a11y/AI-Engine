import { Check, Copy } from 'lucide-react';
import type { FC } from 'react';
import type { Message, ThemeMode } from '../types';
import { BrandAvatar } from './BrandAvatar';
import AIAssistantMessage from './AIAssistantMessage';

interface MessageBubbleProps {
  message: Message;
  isCopied: boolean;
  onCopy: (message: Message) => void;
  theme: ThemeMode;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message, isCopied, onCopy, theme }) => {
  const isUser = message.role === 'user';

  const userBubbleClasses =
    'ml-auto w-full rounded-xl bg-[#3B82F6] px-4 py-3 text-[15px] leading-6 text-white shadow-none transition-colors duration-200 ease-in-out';

  const timestampClass = 'text-foreground/60';

  const copyButtonClasses = [
    'absolute top-3 right-3 flex rounded-full bg-white/15 p-2 text-white opacity-0 shadow-none transition-all duration-150 hover:bg-white/25 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-white/60 md:group-hover:opacity-100'
  ].join(' ');

  return (
    <div
      aria-label={isUser ? 'Mensagem do usuario' : 'Resposta da IA'}
      data-theme={theme}
      className={['group relative flex w-full animate-fade-in-up transition-all duration-200 ease-in-out', isUser ? 'justify-end' : 'justify-start'].join(
        ' '
      )}
    >
      {isUser ? (
        <div className="relative w-full">
          <div className={userBubbleClasses}>
            <p>{message.content}</p>
            <span className={`mt-1 block text-[11px] leading-4 text-white/70`}>{message.timestamp}</span>
          </div>
          <button type="button" aria-label="Copiar resposta" className={copyButtonClasses} onClick={() => onCopy(message)}>
            {isCopied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-white" />}
            <span className="sr-only">{isCopied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-start gap-2">
            <BrandAvatar />
            <div className="text-[13px] font-medium text-foreground">Engine IA</div>
          </div>
          <AIAssistantMessage content={message.content} />
          <span className={`block text-[11px] leading-4 ${timestampClass}`}>{message.timestamp}</span>
        </div>
      )}
    </div>
  );
};
