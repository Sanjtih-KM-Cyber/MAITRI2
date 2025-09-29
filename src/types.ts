// src/types.ts

export type View = 'dashboard' | 'chat' | 'guardian' | 'coPilot' | 'storyteller' | 'playmate';

export type ChatRole = 'Guardian' | 'CoPilot' | 'Storyteller' | 'Playmate';

export interface ThemeContextType {
  accentColor: string;
  changeAccentColor: (newColor: string) => void;
  setSanctuaryActive: (isActive: boolean) => void;
}

export interface PsycheState {
    visualStressScore: number;
    vocalFatigueScore: number;
    combinedWellnessScore: number;
    isCameraActive: boolean;
    isMicActive: boolean;
    status: 'idle' | 'initializing' | 'running' | 'error';
    error: string | null;
}

export interface AppStateContextType {
    activeRole: ChatRole;
    setActiveRole: (role: ChatRole) => void;
    wellness: PsycheState;
    videoRef: React.RefObject<HTMLVideoElement>;
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
