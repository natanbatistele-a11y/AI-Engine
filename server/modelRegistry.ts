export const ALLOWED_MODELS = {
  'gpt-4o-mini': { provider: 'openai', id: 'gpt-4o-mini' },
  'gpt-4o': { provider: 'openai', id: 'gpt-4o' },
  // Aliases usados pelo frontend/presets
  'copy-vsl': { provider: 'openai', id: 'gpt-4o' },
  'ads-feed': { provider: 'openai', id: 'gpt-4o' },
  'story-3telas': { provider: 'openai', id: 'gpt-4o' },
  'post-rapido': { provider: 'openai', id: 'gpt-4o' },
  'video-curto': { provider: 'openai', id: 'gpt-4o' },
  'image_realista': { provider: 'openai', id: 'gpt-4o' },
  'image_criativa_design': { provider: 'openai', id: 'gpt-4o' },
  'video_prompt_realismo': { provider: 'openai', id: 'gpt-4o' }
} as const;

export type AllowedModelKey = keyof typeof ALLOWED_MODELS;

const DEFAULT_MODEL = (process.env.MODEL as AllowedModelKey | undefined) ?? 'gpt-4o';

export const resolveModel = (input?: string) => {
  const alias = (input && input.trim()) || DEFAULT_MODEL;
  if (!alias || !(alias in ALLOWED_MODELS)) {
    return { error: 'unsupported_model', requested: alias } as const;
  }
  const modelInfo = ALLOWED_MODELS[alias as AllowedModelKey];
  return { model: modelInfo.id, aliasUsed: alias } as const;
};