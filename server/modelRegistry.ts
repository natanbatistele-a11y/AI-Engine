export type TaskKey =
  | 'copy-vsl'
  | 'ads-feed'
  | 'story-3telas'
  | 'post-rapido'
  | 'video-curto'
  | 'image_realista'
  | 'image_criativa_design'
  | 'video_prompt_realismo';

export const MODEL_REGISTRY: Record<TaskKey, { provider: 'openai'; model: string }> = {
  'copy-vsl': { provider: 'openai', model: 'gpt-4o' },
  'ads-feed': { provider: 'openai', model: 'gpt-4o' },
  'story-3telas': { provider: 'openai', model: 'gpt-4o' },
  'post-rapido': { provider: 'openai', model: 'gpt-4o' },
  'video-curto': { provider: 'openai', model: 'gpt-4o' },
  image_realista: { provider: 'openai', model: 'gpt-4o' },
  image_criativa_design: { provider: 'openai', model: 'gpt-4o' },
  video_prompt_realismo: { provider: 'openai', model: 'gpt-4o' }
};

const DEFAULT_MODEL = process.env.MODEL ?? 'gpt-4o';

export const resolveModel = (input?: string) => {
  if (!input) {
    return { model: DEFAULT_MODEL, warning: 'missing_model_param' };
  }
  const key = input as TaskKey;
  if (MODEL_REGISTRY[key]) {
    return { model: MODEL_REGISTRY[key].model, aliasUsed: key };
  }

  return {
    model: DEFAULT_MODEL,
    warning: `unknown_model_alias:${input}`
  };
};
