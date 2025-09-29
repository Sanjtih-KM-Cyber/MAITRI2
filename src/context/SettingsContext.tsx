// src/context/SettingsContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type CoPilotVoice = 'male' | 'female';

interface SettingsContextType {
    isTTSOn: boolean;
    toggleTTS: () => void;
    coPilotVoice: CoPilotVoice;
    setCoPilotVoice: (voice: CoPilotVoice) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isTTSOn, setIsTTSOn] = useState(true);
    const [coPilotVoice, setCoPilotVoice] = useState<CoPilotVoice>('female');

    const toggleTTS = () => setIsTTSOn(prev => !prev);

    const value = {
        isTTSOn,
        toggleTTS,
        coPilotVoice,
        setCoPilotVoice,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
