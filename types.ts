export type View = 'dashboard' | 'chat' | 'guardian' | 'coPilot' | 'storyteller' | 'playmate';

export interface ThemeContextType {
  accentColor: string;
  changeAccentColor: (newColor: string) => void;
}

export interface Message {
  text: string;
  role: 'user' | 'model';
}