import React, { createContext, useState, useContext, ReactNode } from 'react';

// FIX: Add a type for the co-pilot's voice gender preference.
type CoPilotVoice = 'male' | 'female';

interface SettingsContextType {
    isTTSOn: boolean;
    toggleTTS: () => void;
    // FIX: Add coPilotVoice to the context to be used for speech synthesis.
    coPilotVoice: CoPilotVoice;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isTTSOn, setIsTTSOn] = useState(true);
    // FIX: Add state for the co-pilot's voice. Defaults to 'female'.
    const [coPilotVoice] = useState<CoPilotVoice>('female');

    const toggleTTS = () => setIsTTSOn(prev => !prev);

    const value = {
        isTTSOn,
        toggleTTS,
        coPilotVoice,
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