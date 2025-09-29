import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './views/Dashboard';
import CompanionView from './views/CompanionView';
import GuardianView from './views/GuardianView';
import CoPilotView from './views/CoPilotView';
import StorytellerView from './views/StorytellerView';
import PlaymateView from './views/PlaymateView';
import TacticalDial from './components/nav/TacticalDial';
import { View } from './types';
import { startListening } from './services/voiceService';
import { parseCommand } from './services/commandService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  useEffect(() => {
    console.log("Setting up global voice commands. Say 'Hey MAITRI, go to dashboard'.");
    
    const handleVoiceResult = (transcript: string) => {
        const lower = transcript.toLowerCase();
        // Listen for the hotword followed by a command in a single phrase
        if (lower.includes('hey maitri')) {
            console.log(`Hotword detected in phrase: "${transcript}"`);
            const commandPhrase = lower.substring(lower.indexOf('hey maitri') + 'hey maitri'.length).trim();
            
            if (commandPhrase) {
              const view = parseCommand(commandPhrase);
              if (view) {
                  console.log(`Command recognized: "${commandPhrase}". Navigating to ${view}.`);
                  navigateTo(view);
              } else {
                  console.log(`Command not recognized in phrase: "${commandPhrase}"`);
              }
            }
        }
    };

    // Use continuous listening for the global command parser
    const stopListening = startListening(
      handleVoiceResult,
      () => {}, // No interim results needed for this
      { continuous: true }
    );
    
    // Cleanup on unmount
    return stopListening;
  }, [navigateTo]);


  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={navigateTo} />;
      case 'chat':
        return <CompanionView setView={navigateTo} />;
      case 'guardian':
        return <GuardianView setView={navigateTo} />;
      case 'coPilot':
        return <CoPilotView setView={navigateTo} />;
      case 'storyteller':
        return <StorytellerView setView={navigateTo} />;
      case 'playmate':
        return <PlaymateView setView={navigateTo} />;
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
        <TacticalDial onRoleSelect={navigateTo} />
      </main>
    </>
  );
};

export default App;