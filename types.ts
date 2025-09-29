export type View = 'dashboard' | 'chat' | 'guardian' | 'coPilot' | 'storyteller' | 'playmate';

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

export interface ThemeContextType {
  accentColor: string;
  changeAccentColor: (newColor: string) => void;
}

export interface Message {
  text: string;
  role: 'user' | 'model' | 'system';
  timestamp?: string;
}

export interface MissionPlan {
    id: string; // Unique ID (e.g., UUID) for the mission entry
    missionName: string; // Human-readable name
    status: 'Pending' | 'Active' | 'Complete' | 'Aborted'; // Mission state
    lastUpdated: string; // ISO string for the date/time of the last update
    packetData: string; // The raw, unparsed "update packet" payload
}

// Added for Phase 8: Structured Mission Data
export interface CadenceItem {
  id: string;
  time?: string;
  title: string;
  name: string; // For compatibility with MassProtocol
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