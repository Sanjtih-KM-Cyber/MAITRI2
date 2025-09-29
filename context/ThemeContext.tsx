
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { ThemeContextType } from '../types';

const defaultAccentColor = '#4A90E2'; // 'Earthrise' blue

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const hexToRgba = (hex: string, alpha: number): string => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return `rgba(74, 144, 226, ${alpha})`; // fallback to default blue
    }
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColor] = useState<string>(defaultAccentColor);

  const changeAccentColor = useCallback((newColor: string) => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
      console.error("Invalid hex color format provided to changeAccentColor:", newColor);
      return;
    }
    setAccentColor(newColor);
    document.documentElement.style.setProperty('--primary-accent-color', newColor);
    document.documentElement.style.setProperty('--widget-border-color', hexToRgba(newColor, 0.3));
    document.documentElement.style.setProperty('--glow-color', hexToRgba(newColor, 0.5));
  }, []);

  const value = useMemo(() => ({ accentColor, changeAccentColor }), [accentColor, changeAccentColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
