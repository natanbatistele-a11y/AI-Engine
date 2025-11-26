import { motion } from 'framer-motion';
import { ArrowUpRight, Globe2, Image, Link2, PenLine, Target, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { PromptContext } from '../data/presets';
import type { ModelOption, ThemeMode } from '../types';

export interface SidebarPanelProps {
  theme: ThemeMode;
  imageModels: ModelOption[];
  copyModels: ModelOption[];
  selectedModel?: ModelOption;
  onSelectModel: (model: ModelOption) => void;
  prompt: PromptContext;
  generatedPrompt: string;
  onPromptChange: (field: keyof PromptContext, value: string) => void;
  onGeneratePrompt: () => void;
  onPromptGenerated?: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SectionHeading: FC<{ icon: JSX.Element; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--border)] bg-card text-foreground">
      {icon}
    </span>
    <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">{title}</h3>
  </div>
);

const ModelCard: FC<{
  model: ModelOption;
  active: boolean;
  onSelect: (model: ModelOption) => void;
}> = ({ model, active, onSelect }) => {
  const baseClasses = 'border border-[var(--border)] bg-card text-foreground hover:border-[var(--border)] hover:shadow-sm';
  const activeClasses = 'border border-[#3B82F6] bg-card text-foreground shadow-sm';

  return (
    <button
      type="button"
      onClick={() => onSelect(model)}
      className={[
        'group flex h-12 w-full items-center justify-center rounded-2xl border px-4 transition-all duration-200',
        active ? activeClasses : baseClasses
      ].join(' ')}
    >
      <span className="font-heading text-sm font-semibold leading-none tracking-tight">{model.label}</span>
    </button>
  );
};

const Field: FC<{
  id: string;
  label: string;
  value: string;
  placeholder: string;
  icon: JSX.Element;
  onChange: (value: string) => void;
}> = ({ id, label, value, placeholder, icon, onChange }) => (
  <label className="group flex w-full flex-col space-y-2" htmlFor={id}>
    <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      {label}
    </span>
    <input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-[var(--border)] bg-card px-4 py-3 text-sm text-foreground transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
    />
  </label>
);

export const SidebarPanel: FC<SidebarPanelProps> = ({
  theme,
  imageModels,
  copyModels,
  selectedModel,
  onSelectModel,
  prompt,
  generatedPrompt,
  onPromptChange,
  onGeneratePrompt,
  isOpen,
  onClose
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const brainEmoji = String.fromCodePoint(0x1f9e0);
  const keyboardEmoji = String.fromCodePoint(0x2328, 0xfe0f);
  const panelClasses =
    'pointer-events-auto fixed top-0 bottom-0 left-0 z-[80] flex w-full max-w-[420px] flex-col border border-[var(--border)] bg-[var(--muted)] px-6 py-6 text-foreground transition-[transform,opacity,background-color] duration-300 ease-in-out focus:outline-none';

  useEffect(() => {
    if (!isOpen) return;
    const node = panelRef.current;
    if (!node) return;
    const focusable =
      node.querySelector<HTMLElement>('[data-dialog-autofocus]') ??
      node.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <motion.aside
      key="creation-panel"
      id="engine-sidebar"
      ref={panelRef}
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-labelledby="creation-panel-heading"
      tabIndex={-1}
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={panelClasses}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 id="creation-panel-heading" className="text-3xl font-black tracking-tight">
            {'Painel de Criação'}
          </h2>
          <div className="mt-2 flex items-start gap-2 md:gap-3 flex-nowrap text-sm">
            <span aria-hidden="true" className="text-lg md:text-xl leading-none shrink-0">
              {brainEmoji}
            </span>
            <p className="text-foreground/80">
              {'Comece a refinar seus objetivos em prompts otimizados que te geram conteúdo de relevância.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-dialog-autofocus
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] text-foreground/70 transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          aria-label="Fechar painel"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-8 overflow-y-auto pr-1">
        <section className="space-y-4">
          <SectionHeading icon={<Image className="h-4 w-4" aria-hidden="true" />} title="Modelos de Imagem" />
          <div className="grid grid-cols-1 gap-3">
            {imageModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                active={selectedModel?.id === model.id}
                onSelect={onSelectModel}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeading icon={<PenLine className="h-4 w-4" aria-hidden="true" />} title="Modelos de Copy" />
          <div className="grid grid-cols-1 gap-3">
            {copyModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                active={selectedModel?.id === model.id}
                onSelect={onSelectModel}
              />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-start gap-2 md:gap-3 flex-nowrap">
            <span className="text-lg md:text-xl leading-none shrink-0" aria-hidden="true">
              {keyboardEmoji}
            </span>
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-heading text-base font-semibold text-foreground">Prompt Inteligente</h3>
              <p className="text-sm leading-6 text-foreground/80">
                {'Preencha os dados e obtenha o comando instantâneo para colar em qualquer IA'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Field
              id="prompt-niche"
              label="Nicho"
              value={prompt.niche}
              placeholder="Segmento ou publico principal"
              icon={<Globe2 className="h-3.5 w-3.5" aria-hidden="true" />}
              onChange={(value) => onPromptChange('niche', value)}
            />
            <Field
              id="prompt-product"
              label="Produto"
              value={prompt.product}
              placeholder="Oferta e diferenciais"
              icon={<Image className="h-3.5 w-3.5" aria-hidden="true" />}
              onChange={(value) => onPromptChange('product', value)}
            />
            <Field
              id="prompt-objective"
              label="Objetivo"
              value={prompt.goal}
              placeholder="Conversão desejada"
              icon={<Target className="h-3.5 w-3.5" aria-hidden="true" />}
              onChange={(value) => onPromptChange('goal', value)}
            />
            <Field
              id="prompt-link"
              label="CTA"
              value={prompt.cta ?? ''}
              placeholder="Link ou chamada final"
              icon={<Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
              onChange={(value) => onPromptChange('cta', value)}
            />
          </div>

          <button
            type="button"
            onClick={onGeneratePrompt}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-0"
          >
            Gerar prompt
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {generatedPrompt && (
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-1">Prompt gerado:</div>

              <div className="relative bg-muted p-3 rounded-xl text-xs whitespace-pre-wrap">
                {generatedPrompt}

                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(generatedPrompt)}
                  className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded bg-background border hover:bg-muted transition"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.aside>
  );
};
