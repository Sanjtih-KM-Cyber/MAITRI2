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
  const [isListening, setIsListening] = useState(false);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  useEffect(() => {
    // This is a simplified hotword implementation. In a real app,
    // this would be a more sophisticated, lower-power model.
    console.log("Setting up voice commands. Say 'Hey MAITRI' then a command like 'go to dashboard'.");
    const handleVoiceResult = (transcript: string) => {
      const lowerTranscript = transcript.toLowerCase();
      if (isListening) {
        const view = parseCommand(lowerTranscript);
        if (view) {
          console.log(`Command recognized: "${transcript}". Navigating to ${view}.`);
          navigateTo(view);
        } else {
          console.log(`Command not recognized: "${transcript}"`);
        }
        setIsListening(false);
      } else if (lowerTranscript.includes('hey maitri')) {
        console.log("Hotword detected! Listening for command...");
        setIsListening(true);
        // Add feedback for user, e.g. a sound or visual cue
      }
    };

    const stopListening = startListening(handleVoiceResult, () => {});
    return () => {
      stopListening();
    };
  }, [isListening, navigateTo]);


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
