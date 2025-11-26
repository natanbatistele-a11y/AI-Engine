import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import type { PromptContext } from '../data/presets';
import type { ModelOption, ThemeMode } from '../types';
import { ChatArea } from './ChatArea';
import type { ChatAreaProps } from './ChatArea';
import { Header } from './Header';
import type { HeaderProps } from './Header';
import { SidebarPanel } from './SidebarPanel';
import type { SidebarPanelProps } from './SidebarPanel';

interface LayoutProps {
  theme: ThemeMode;
  header: Omit<HeaderProps, 'onTogglePanel' | 'isPanelOpen' | 'logoButtonRef'>;
  sidebar: Omit<SidebarPanelProps, 'isOpen' | 'onClose' | 'theme'>;
  chat: Omit<ChatAreaProps, 'theme'>;
}

const Layout: FC<LayoutProps> = ({ theme, header, sidebar, chat }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const logoButtonRef = useRef<HTMLButtonElement | null>(null);
  const { onStartNewChat, ...headerRest } = header;

  useEffect(() => {
    const updateViewport = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileViewport(isMobile);
      if (isMobile) {
        setIsPanelOpen(false);
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('panel-locked', isPanelOpen);
    return () => {
      document.body.classList.remove('panel-locked');
    };
  }, [isPanelOpen]);

  const closePanel = useCallback(
    (options?: { focusLogo?: boolean }) => {
      setIsPanelOpen(false);
      const shouldFocusLogo = options?.focusLogo ?? true;
      if (!shouldFocusLogo) return;
      window.requestAnimationFrame(() => {
        logoButtonRef.current?.focus({ preventScroll: true });
      });
    },
    [logoButtonRef]
  );

  useEffect(() => {
    if (!isPanelOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel]);

  const togglePanel = useCallback(() => {
    if (isPanelOpen) {
      closePanel();
    } else {
      setIsPanelOpen(true);
    }
  }, [isPanelOpen, closePanel]);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const handleSelectModel = useCallback(
    (model: ModelOption) => {
      sidebar.onSelectModel(model);
      if (isMobileViewport) {
        closePanel();
      }
    },
    [sidebar, isMobileViewport, closePanel]
  );

  const handlePromptChange = useCallback(
    (field: keyof PromptContext, value: string) => {
      sidebar.onPromptChange(field, value);
    },
    [sidebar]
  );

  const handleGeneratePrompt = useCallback(() => {
    sidebar.onGeneratePrompt();
    if (isMobileViewport) {
      closePanel();
    }
  }, [sidebar, isMobileViewport, closePanel]);

  const enhancedSidebarProps: SidebarPanelProps = useMemo(
    () => ({
      ...sidebar,
      onSelectModel: handleSelectModel,
      onPromptChange: handlePromptChange,
      onGeneratePrompt: handleGeneratePrompt,
      theme,
      isOpen: isPanelOpen,
      onClose: () => closePanel()
    }),
    [sidebar, handleSelectModel, handlePromptChange, handleGeneratePrompt, isPanelOpen, closePanel, theme]
  );

  const enhancedChatProps: ChatAreaProps = useMemo(
    () => ({
      ...chat,
      theme,
      onOpenPanel: openPanel,
      onComposerFocus: () => {
        chat.onComposerFocus?.();
        if (isMobileViewport && isPanelOpen) {
          closePanel();
        }
      }
    }),
    [chat, isMobileViewport, isPanelOpen, closePanel, theme, openPanel]
  );

  const handleNewChat = useCallback(() => {
    if (isPanelOpen) {
      closePanel({ focusLogo: false });
    }
    onStartNewChat();
  }, [isPanelOpen, closePanel, onStartNewChat]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleNewChat]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 ease-in-out">
      <Header
        {...headerRest}
        onStartNewChat={handleNewChat}
        onTogglePanel={togglePanel}
        isPanelOpen={isPanelOpen}
        logoButtonRef={logoButtonRef}
      />

      <main className="flex w-full flex-1 justify-center py-6">
        <div className="flex h-full w-[70%] max-w-5xl flex-col gap-4 px-2 md:px-0">
          <ChatArea key={enhancedChatProps.chatId ?? 'default-chat'} {...enhancedChatProps} />
        </div>
      </main>

      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            key="panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm transition"
            onClick={() => closePanel()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPanelOpen && <SidebarPanel key="sidebar" {...enhancedSidebarProps} />}
      </AnimatePresence>
    </div>
  );
};

export default Layout;









