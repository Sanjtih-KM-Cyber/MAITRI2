import { TimeOfDay } from '../types';

const palettes = {
  dawn: {
    '--background-color': '#1a1a2e',
    '--widget-background-color': 'rgba(40, 40, 60, 0.7)',
    '--subtle-glow-color': 'rgba(233, 100, 121, 0.3)',
  },
  morning: {
    '--background-color': '#0d1b2a',
    '--widget-background-color': 'rgba(25, 40, 60, 0.7)',
    '--subtle-glow-color': 'rgba(255, 214, 107, 0.3)',
  },
  afternoon: {
    '--background-color': '#0A0A1A',
    '--widget-background-color': 'rgba(20, 20, 40, 0.7)',
    '--subtle-glow-color': 'rgba(74, 144, 226, 0.2)',
  },
  dusk: {
    '--background-color': '#1c162e',
    '--widget-background-color': 'rgba(45, 35, 65, 0.7)',
    '--subtle-glow-color': 'rgba(255, 127, 80, 0.4)',
  },
  night: {
    '--background-color': '#050510',
    '--widget-background-color': 'rgba(15, 15, 30, 0.7)',
    '--subtle-glow-color': 'rgba(138, 43, 226, 0.2)',
  },
};

/**
 * Applies a theme by updating CSS variables on the root element.
 * @param timeOfDay The current time of day identifier.
 */
export const applyTimeOfDayTheme = (timeOfDay: TimeOfDay) => {
  const theme = palettes[timeOfDay] || palettes.night;
  const root = document.documentElement;

  for (const [property, value] of Object.entries(theme)) {
    root.style.setProperty(property, value);
  }
};
