import { View } from '../types';

const commandMap: { [key: string]: View } = {
  "dashboard": "dashboard",
  "home": "dashboard",
  "main screen": "dashboard",
  "chat": "chat",
  "talk to maitri": "chat",
  "guardian": "guardian",
  "wellness": "guardian",
  "copilot": "coPilot",
  "mission": "coPilot",
  "procedures": "coPilot",
  "storyteller": "storyteller",
  "diary": "storyteller",
  "log": "storyteller",
  "playmate": "playmate",
  "game": "playmate",
  "play a game": "playmate",
};

/**
 * Parses a transcribed string to find a navigation command.
 * @param transcript - The voice transcript.
 * @returns The target View if a command is found, otherwise null.
 */
export const parseCommand = (transcript: string): View | null => {
  const words = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '');

  for (const command in commandMap) {
    if (words.includes(command)) {
      return commandMap[command];
    }
  }

  return null;
};
