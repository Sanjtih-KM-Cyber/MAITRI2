// src/context/AppStateContext.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { usePsycheState as usePsycheStateHook } from '../hooks/usePsycheState';
import { AppStateContextType, ChatRole, PsycheState } from '../types';

const defaultPsycheState: PsycheState = {
    visualStressScore: 0,
    vocalFatigueScore: 0,
    combinedWellnessScore: 0,
    isCameraActive: false,
    isMicActive: false,
    status: 'idle',
    error: null,
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 1. Core Role State
    const [activeRole, setActiveRole] = useState<ChatRole>('Guardian');
    
    // 2. Psyche-State Integration
    const { wellness, videoRef, status, error } = usePsycheStateHook();
    
    // Calculate the combined score (0-100 to 0-10) for UI display
    const combinedWellnessScore = parseFloat(((wellness.stress + wellness.fatigue) / 20).toFixed(1));

    const stateValue = useMemo(() => ({
        activeRole,
        setActiveRole,
        wellness: {
            ...defaultPsycheState,
            visualStressScore: wellness.stress,
            vocalFatigueScore: wellness.fatigue,
            combinedWellnessScore, // The actionable 0-10 score
            status,
            error,
        },
        videoRef,
    }), [activeRole, wellness.stress, wellness.fatigue, combinedWellnessScore, status, error, videoRef]);

    return (
        <AppStateContext.Provider value={stateValue}>
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = (): AppStateContextType => {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};
