import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

interface SettingsContextType {
  isTTSOn: boolean;
  toggleTTS: () => void;
  coPilotVoice: 'male' | 'female';
  setCoPilotVoice: (gender: 'male' | 'female') => void;
  homeTimeZone: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTTSOn, setIsTTSOn] = useState(true);
  const [coPilotVoice, setCoPilotVoice] = useState<'male' | 'female'>('female');
  const [homeTimeZone] = useState<string>('Europe/London');

  const toggleTTS = useCallback(() => {
    setIsTTSOn(prev => !prev);
  }, []);

  const handleSetCoPilotVoice = useCallback((gender: 'male' | 'female') => {
    setCoPilotVoice(gender);
  }, []);

  const value = useMemo(() => ({ 
      isTTSOn, 
      toggleTTS, 
      coPilotVoice, 
      setCoPilotVoice: handleSetCoPilotVoice,
      homeTimeZone,
  }), [isTTSOn, toggleTTS, coPilotVoice, handleSetCoPilotVoice, homeTimeZone]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};