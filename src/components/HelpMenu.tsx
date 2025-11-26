import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, LifeBuoy, Sparkles, Instagram, Music3, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

interface HelpMenuItem {
  label: string;
  icon: JSX.Element;
  onClick?: () => void;
  href?: string;
}

export const HelpMenu: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const items: HelpMenuItem[] = [
    { label: 'Preciso de ajuda', icon: <LifeBuoy className="h-4 w-4" aria-hidden="true" /> },
    { label: 'Solicitar uma funcionalidade', icon: <Sparkles className="h-4 w-4" aria-hidden="true" /> },
    { label: 'Instagram', icon: <Instagram className="h-4 w-4" aria-hidden="true" />, href: 'https://www.instagram.com/iaengine_/' },
    { label: 'TikTok', icon: <Music3 className="h-4 w-4" aria-hidden="true" />, href: 'https://www.tiktok.com/@iaengine_' },
    { label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" aria-hidden="true" /> }
  ];

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!isOpen) return;
    const target = event.target as Node;
    if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) {
      return;
    }
    setIsOpen(false);
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-muted text-foreground shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Abrir menu de ajuda"
      >
        <HelpCircle className="h-6 w-6" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-64 rounded-2xl border border-[var(--border)] bg-background p-3 text-foreground shadow-xl"
          >
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Centro de ajuda
            </p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-left text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="w-full rounded-xl px-3 py-2 text-sm text-left text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpMenu;
