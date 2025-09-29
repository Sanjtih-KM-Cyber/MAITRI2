// src/context/ThemeContext.tsx

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { ThemeContextType } from '../types';
import { useAppState } from './AppStateContext';

interface ExtendedThemeContextType extends ThemeContextType {
    setSanctuaryActive: (isActive: boolean) => void;
}

const ThemeContext = createContext<ExtendedThemeContextType | undefined>(undefined);

const defaultAccentColor = '#4A90E2'; // 'Earthrise' blue
const CALMING_COLOR = '#388E3C';    // A deep, calming green for high stress
const EVENING_COLOR = '#D2691E';    // A warmer (Cochineal) color for evening
const SANCTUARY_COLOR = '#8E44AD'; // A unique, deep purple for sanctuary mode

const hexToRgba = (hex: string, alpha: number): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return `rgba(74, 144, 226, ${alpha})`;
    }
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { wellness } = useAppState();
  const [accentColor, setAccentColor] = useState<string>(defaultAccentColor);
  const [userSelectedColor, setUserSelectedColor] = useState<string>(defaultAccentColor);
  const [isBioOverrideActive, setIsBioOverrideActive] = useState(false);
  const [hasUserMadeSelection, setHasUserMadeSelection] = useState(false);
  const [isSanctuaryActive, setSanctuaryActive] = useState(false); // NEW for Sensory Immersion

  const applyAccentColor = useCallback((color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--primary-accent-color', color);
    document.documentElement.style.setProperty('--widget-border-color', hexToRgba(color, 0.3));
    document.documentElement.style.setProperty('--glow-color', hexToRgba(color, 0.5));
  }, []);

  const changeAccentColor = useCallback((newColor: string) => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
      console.error("Invalid hex color format provided to changeAccentColor:", newColor);
      return;
    }
    setUserSelectedColor(newColor);
    setHasUserMadeSelection(true);
    setIsBioOverrideActive(false); 
    applyAccentColor(newColor);
  }, [applyAccentColor]);


  useEffect(() => {
    const score = wellness.combinedWellnessScore;

    // --- PRIORITY 1: SENSORY IMMERSION (SANCTUARY) ---
    if (isSanctuaryActive) {
        if (accentColor !== SANCTUARY_COLOR) {
            applyAccentColor(SANCTUARY_COLOR);
        }
        return;
    }

    // --- PRIORITY 2: BIO-ADAPTIVE THEME ---
    if (score >= 7.5 && !isBioOverrideActive) {
      setIsBioOverrideActive(true);
      applyAccentColor(CALMING_COLOR);
      return;
    } 
    
    if (isBioOverrideActive && score < 6.0) {
      setIsBioOverrideActive(false);
    } else if (isBioOverrideActive) {
      return;
    }
    
    // --- PRIORITY 3 & 4: USER SELECTION OR CIRCADIAN THEME ---
    let targetColor: string;

    if (hasUserMadeSelection) {
        targetColor = userSelectedColor;
    } else {
        const currentHour = new Date().getHours();
        targetColor = (currentHour >= 18 || currentHour < 6) ? EVENING_COLOR : defaultAccentColor;
    }
    
    if (accentColor !== targetColor) {
        applyAccentColor(targetColor);
    }
    
  }, [wellness.combinedWellnessScore, isBioOverrideActive, applyAccentColor, accentColor, userSelectedColor, hasUserMadeSelection, isSanctuaryActive]);
  
  const value = useMemo(() => ({ accentColor, changeAccentColor, setSanctuaryActive }), [accentColor, changeAccentColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ExtendedThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
