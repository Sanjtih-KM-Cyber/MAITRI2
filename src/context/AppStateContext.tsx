// src/context/AppStateContext.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { usePsycheState as usePsycheStateHook } from '../hooks/usePsycheState';
import { AppStateContextType, ChatRole, PsycheState } from '../types';

interface ExtendedAppStateContextType extends AppStateContextType {
    setWellnessOverride: (override: { stress: number; fatigue: number; }) => void;
}

const AppStateContext = createContext<ExtendedAppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeRole, setActiveRole] = useState<ChatRole>('Guardian');
    const { wellness: liveWellness, videoRef, status, error } = usePsycheStateHook();
    const [wellnessOverride, setWellnessOverride] = useState<{ stress: number; fatigue: number; } | null>(null);

    const wellness = useMemo(() => {
        const stress = wellnessOverride ? wellnessOverride.stress : liveWellness.stress;
        const fatigue = wellnessOverride ? wellnessOverride.fatigue : liveWellness.fatigue;

        return {
            visualStressScore: stress,
            vocalFatigueScore: fatigue,
            combinedWellnessScore: parseFloat(((stress + fatigue) / 20).toFixed(1)),
            isCameraActive: status === 'running',
            isMicActive: status === 'running',
            status,
            error,
        };
    }, [liveWellness, wellnessOverride, status, error]);
    
    const stateValue = useMemo(() => ({
        activeRole,
        setActiveRole,
        wellness,
        videoRef,
        setWellnessOverride,
    }), [activeRole, wellness, videoRef, setWellnessOverride]);

    return (
        <AppStateContext.Provider value={stateValue}>
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = (): ExtendedAppStateContextType => {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};
