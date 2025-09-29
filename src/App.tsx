// src/App.tsx (MODIFIED)
import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './views/Dashboard';
import CompanionView from './views/CompanionView';
import GuardianView from './views/GuardianView';
import CoPilotView from './views/CoPilotView';
import StorytellerView from './views/StorytellerView';
import PlaymateView from './views/PlaymateView';
import TacticalDial from './components/nav/TacticalDial';
import { View, ChatRole } from './types';
import { startListening } from './services/voiceService';
import { parseCommand } from './services/commandService';
import { useAppState } from './context/AppStateContext';

// The main application content component (uses context)
const AppContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [viewOptions, setViewOptions] = useState<any>({});
    const [isDialOpen, setIsDialOpen] = useState(false);
    const { setActiveRole } = useAppState();

    const navigateTo = useCallback((view: View, options: any = {}) => {
        setCurrentView(view);
        setViewOptions(options);

        if (view !== 'dashboard' && view !== 'chat') {
            setActiveRole(view.charAt(0).toUpperCase() + view.slice(1) as ChatRole);
        } else if (view === 'chat') {
            setActiveRole('Guardian'); // Default chat is Guardian
        }
    }, [setActiveRole]);

    useEffect(() => {
        const handleVoiceResult = (transcript: string) => {
            const lower = transcript.toLowerCase();
            if (lower.includes('hey maitri')) {
                const commandPhrase = lower.substring(lower.indexOf('hey maitri') + 'hey maitri'.length).trim();
                if (commandPhrase) {
                    const command = parseCommand(commandPhrase);
                    if (command) {
                        switch (command.type) {
                            case 'NAVIGATE':
                                navigateTo(command.payload);
                                break;
                            case 'DIAL':
                                setIsDialOpen(command.payload === 'open');
                                break;
                        }
                    }
                }
            }
        };

        const stopListening = startListening(handleVoiceResult, () => {}, { continuous: true });
        
        return stopListening;
    }, [navigateTo]);


    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setView={navigateTo} />;
            case 'chat':
                 return <CompanionView setView={navigateTo} initialMessage={viewOptions.initialMessage} />;
            case 'playmate':
                return <CompanionView setView={navigateTo} isPlaymate={true} />;
            case 'guardian':
                return <GuardianView setView={navigateTo} />;
            case 'coPilot':
                return <CoPilotView setView={navigateTo} />;
            case 'storyteller':
                return <StorytellerView setView={navigateTo} />;
            default:
                return <Dashboard setView={navigateTo} />;
        }
    }

    return (
        <>
            <main className="h-screen w-screen bg-background text-primary-text font-sans overflow-hidden transition-colors duration-1000">
                <div className="h-full w-full overflow-auto">
                    {renderView()}
                </div>
                <TacticalDial 
                    onRoleSelect={navigateTo} 
                    isOpen={isDialOpen} 
                    setIsOpen={setIsDialOpen} 
                />
            </main>
        </>
    );
};

const App: React.FC = () => (
    <AppContent />
);

export default App;