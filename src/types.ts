export type ThemeMode = 'light' | 'dark';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export type ModelDiscipline = 'image' | 'copy';

export interface ModelOption {
  id: string;
  label: string;
  description: string;
  discipline: ModelDiscipline;
}
