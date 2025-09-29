import { View } from '../types';

export type Command = 
  | { type: 'NAVIGATE'; payload: View }
  | { type: 'DIAL'; payload: 'open' | 'close' };

const commandMap: { [key: string]: Command } = {
  "dashboard": { type: 'NAVIGATE', payload: 'dashboard' },
  "home": { type: 'NAVIGATE', payload: 'dashboard' },
  "main screen": { type: 'NAVIGATE', payload: 'dashboard' },
  "chat": { type: 'NAVIGATE', payload: 'chat' },
  "talk to maitri": { type: 'NAVIGATE', payload: 'chat' },
  "guardian": { type: 'NAVIGATE', payload: 'guardian' },
  "wellness": { type: 'NAVIGATE', payload: 'guardian' },
  "copilot": { type: 'NAVIGATE', payload: 'coPilot' },
  "mission": { type: 'NAVIGATE', payload: 'coPilot' },
  "procedures": { type: 'NAVIGATE', payload: 'coPilot' },
  "storyteller": { type: 'NAVIGATE', payload: 'storyteller' },
  "diary": { type: 'NAVIGATE', payload: 'storyteller' },
  "log": { type: 'NAVIGATE', payload: 'storyteller' },
  "playmate": { type: 'NAVIGATE', payload: 'playmate' },
  "game": { type: 'NAVIGATE', payload: 'playmate' },
  "play a game": { type: 'NAVIGATE', payload: 'playmate' },
  "open dial": { type: 'DIAL', payload: 'open' },
  "show dial": { type: 'DIAL', payload: 'open' },
  "open menu": { type: 'DIAL', payload: 'open' },
  "show menu": { type: 'DIAL', payload: 'open' },
  "close dial": { type: 'DIAL', payload: 'close' },
  "hide dial": { type: 'DIAL', payload: 'close' },
  "close menu": { type: 'DIAL', payload: 'close' },
  "hide menu": { type: 'DIAL', payload: 'close' },
};

/**
 * Parses a transcribed string to find a command.
 * @param transcript - The voice transcript.
 * @returns The command object if found, otherwise null.
 */
export const parseCommand = (transcript: string): Command | null => {
  const words = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '');

  // Look for exact matches first for better accuracy
  for (const command in commandMap) {
    if (words.includes(command)) {
      return commandMap[command];
    }
  }

  return null;
};