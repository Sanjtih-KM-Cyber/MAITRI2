export type View = 'dashboard' | 'chat' | 'guardian' | 'coPilot' | 'storyteller' | 'playmate';

export interface ThemeContextType {
  accentColor: string;
  changeAccentColor: (newColor: string) => void;
}

export interface Message {
  text: string;
  role: 'user' | 'model' | 'system';
  timestamp?: string;
}

export interface CadenceItem {
  id: string;
  time?: string;
  title: string;
  name: string;
  completed?: boolean;
  duration?: string;
  sets?: string;
}

export interface ChecklistStep {
  step: number;
  title: string;
  instruction: string;
}

export interface MissionChecklist {
  title: string;
  procedureID: string;
  steps: ChecklistStep[];
}
