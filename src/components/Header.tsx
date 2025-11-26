import { LogOut, MoreVertical, Moon, PencilLine, Sun } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FC, RefObject } from 'react';
import type { ThemeMode } from '../types';

export interface HeaderProps {
  logoButtonRef?: RefObject<HTMLButtonElement>;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout?: () => void;
  onStartNewChat: () => void;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

const logoPlaceholderPath = '/assets/logo.svg';
// TODO: substitua `logoPlaceholderPath` por um import estatico quando a logo final estiver disponivel.

interface NewChatButtonProps {
  onStartNewChat: () => void;
}

const NewChatButton: FC<NewChatButtonProps> = ({ onStartNewChat }) => {
  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      const platform = navigator.platform?.toLowerCase() ?? '';
      const isMac = platform.includes('mac');
      const comboPressed = isMac ? event.metaKey : event.ctrlKey;
      if (comboPressed && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        onStartNewChat();
      }
    };

    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [onStartNewChat]);

  return (
    <button
      type="button"
      data-btn="new-chat"
      onClick={onStartNewChat}
      aria-label="Novo chat"
      title="Novo chat (Ctrl+N)"
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium bg-[var(--card)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--card)_90%,black_10%)] dark:bg-[var(--card)] dark:text-[var(--foreground)] dark:hover:bg-[color-mix(in_srgb,var(--card)_85%,white_5%)] border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition hover:scale-[1.03] active:scale-[0.98]"
    >
      <PencilLine className="h-4 w-4 text-foreground" aria-hidden="true" />
      <span className="hidden sm:inline">Novo chat</span>
    </button>
  );
};

interface HeaderMenuProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout?: () => void;
}

const HeaderMenu: FC<HeaderMenuProps> = ({ theme, onToggleTheme, onLogout }) => {
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == 'Escape') {
        event.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  useEffect(() => {
    if (isOpen) {
      firstItemRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggleMenu = () => setIsOpen((prev) => !prev);

  const handleThemeClick = () => {
    onToggleTheme();
    closeMenu();
  };

  const handleLogoutClick = () => {
    onLogout?.();
    closeMenu();
  };

  const switchTrackClasses = [
    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
    isDark ? 'bg-indigo-500/80' : 'bg-[color-mix(in_srgb,var(--muted),var(--foreground)_20%)]'
  ].join(' ');

  const switchThumbClasses = [
    'inline-block h-4 w-4 transform rounded-full border border-[var(--border)] bg-card shadow transition-transform',
    isDark ? 'translate-x-4' : 'translate-x-1'
  ].join(' ');

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={handleToggleMenu}
        title="Mais opcoes"
        className="mr-[2px] inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground opacity-80 transition hover:bg-[var(--muted)] hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:mr-[4px]"
      >
        <MoreVertical size={20} aria-hidden="true" />
        <span className="sr-only">Abrir menu do cabecalho</span>
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-[var(--border)] bg-card p-2 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            tabIndex={0}
            ref={firstItemRef}
            onClick={handleThemeClick}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-[var(--muted)] focus:outline-none"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
              <span>Tema</span>
            </span>
            <span className={switchTrackClasses} aria-hidden="true">
              <span className={switchThumbClasses} />
            </span>
          </button>

          <div className="my-1 h-px bg-[var(--border)]" aria-hidden="true" />

          <button
            type="button"
            role="menuitem"
            tabIndex={0}
            onClick={handleLogoutClick}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-500/10 focus:outline-none"
          >
            <LogOut size={16} className="rotate-180" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const Header: FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onLogout,
  onStartNewChat,
  onTogglePanel,
  isPanelOpen,
  logoButtonRef
}) => {
  const headerClass =
    'sticky top-0 z-50 w-full border-b-0 border-transparent bg-background/80 text-foreground backdrop-blur transition-[background-color,color,border-color] duration-300 ease-in-out';

  const innerWrapperClass = 'relative flex w-full items-center justify-between px-4 py-2 sm:px-6';

  const leftGroupClass = 'flex items-center gap-3';

  const centerButtonWrapperClass = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';

  const rightGroupClass = 'ml-auto flex items-center gap-2 sm:gap-3';

  const logoButtonClass =
    'group inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center gap-3 rounded-full px-3 py-2 bg-[var(--card)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--card)_90%,black_10%)] dark:bg-[var(--card)] dark:text-[var(--foreground)] dark:hover:bg-[color-mix(in_srgb,var(--card)_85%,white_5%)] border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition hover:scale-[1.03]';

  const logoWrapperClass =
    'relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-card shadow-sm transition-all duration-200 ease-out group-hover:scale-105 group-hover:opacity-90 group-hover:shadow-md';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const brandBtn = document.querySelector('[data-btn="brand-left"]') as HTMLElement | null;
    const newChatBtn = document.querySelector('[data-btn="new-chat"]') as HTMLElement | null;
    if (!brandBtn || !newChatBtn) return;
    console.log('BTN_COLORS', {
      brand: getComputedStyle(brandBtn).backgroundColor,
      newChat: getComputedStyle(newChatBtn).backgroundColor
    });
  }, [theme, isPanelOpen]);

  return (
    <header className={headerClass} role="banner">
      <div className={innerWrapperClass}>
        <div className={leftGroupClass}>
          <button
            ref={logoButtonRef}
            type="button"
            data-btn="brand-left"
            className={logoButtonClass}
            onClick={onTogglePanel}
            aria-expanded={isPanelOpen}
            aria-controls="engine-sidebar"
            aria-label="Abrir painel de criacao"
          >
            <span className={logoWrapperClass}>
              <img
                src={logoPlaceholderPath}
                alt="Logo Ia Engine - abrir painel de criacao"
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
              />
            </span>
            <div className="flex flex-col justify-center text-left leading-tight">
              <span className="font-heading text-lg font-semibold tracking-tight">Ia Engine</span>
            </div>
            <span
              className={[
                'ml-2 h-2 w-2 rounded-full transition-all duration-300',
                isPanelOpen ? 'bg-[#3B82F6] shadow-[0_0_0_5px_rgba(59,130,246,0.25)]' : 'bg-foreground/30'
              ].join(' ')}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className={centerButtonWrapperClass}>
          <NewChatButton onStartNewChat={onStartNewChat} />
        </div>

        <div className={rightGroupClass} role="group" aria-label="Acoes rapidas">
          <HeaderMenu theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};
