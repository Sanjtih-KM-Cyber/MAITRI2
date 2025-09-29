// src/views/CompanionView.tsx (MODIFIED for Ollama/Adaptive Tonality)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Message } from '../types';
import MessageBubble from '../components/chat/MessageBubble';
import SmartInput from '../components/chat/SmartInput';
import { runMAITRI } from '../services/localAIService'; // NEW: Use new Ollama service
import { useSettings } from '../context/SettingsContext';
import { speak } from '../services/voiceService';
import { useAppState } from '../context/AppStateContext'; // NEW: Get role/wellness

interface CompanionViewProps {
  setView?: (view: View) => void;
  initialMessage?: string;
  onListeningStateChange?: (isListening: boolean) => void;
  isPlaymate?: boolean; // NEW: Flag to know if we are in the Playmate view
}

const CompanionView: React.FC<CompanionViewProps> = ({ setView, initialMessage, onListeningStateChange, isPlaymate = false }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isTTSOn, coPilotVoice } = useSettings();
  const { activeRole, wellness } = useAppState(); // Get the current active role and wellness score

  // Set the correct initial message based on the role
  const initialText = isPlaymate 
    ? t('playmate.initialMessage') 
    : (initialMessage || t('chat.initialMessage'));

  useEffect(() => {
    // Only set the initial message if the list is empty
    if(messages.length === 0) {
        setMessages([{ role: 'model', text: initialText }]);
    }
  }, [initialText, messages.length]); 


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage: Message = { role: 'user', text: inputText, timestamp };
    
    // Use the role set by the TacticalDial or App.tsx (Guardian, CoPilot, etc.)
    const currentRole = isPlaymate ? 'Playmate' : activeRole; 
    
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    
    try {
      // Prepare history for AI
      const historyForAI = currentMessages.filter(m => m.role !== 'system');
      
      // Add a temporary loading message
      setMessages(prev => [...prev, { role: 'model', text: '...' }]);
      
      // Call the new runMAITRI service with the current wellness score
      const aiResponse = await runMAITRI(
        currentRole, 
        historyForAI, 
        inputText, 
        wellness.combinedWellnessScore // Pass the score for Adaptive Tonality
      );

      const finalTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const finalMessage: Message = { role: 'model', text: aiResponse, timestamp: finalTimestamp };

      setMessages(prev => {
          // Replace the '...' loading message with the final response
          return [...prev.slice(0, -1), finalMessage];
      });

      // 1. Multilingual Voice I/O (5.1)
      if (isTTSOn) {
        // Use the Co-Pilot voice setting for MAITRI's output gender
        speak(aiResponse, coPilotVoice); 
      }
      
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = { role: 'model', text: t('services.localAI.connectionError') };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, t, isTTSOn, coPilotVoice, activeRole, wellness.combinedWellnessScore, isPlaymate]);


  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 animate-fadeIn">
       {setView && (
         <header className="flex items-center mb-4 flex-shrink-0">
            <button
              onClick={() => setView('dashboard')}
              aria-label={t('common.backToDashboard')}
              className="flex items-center text-primary-accent hover:text-primary-text transition-colors duration-200 p-2 rounded-lg -ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-lg font-medium hidden md:block">{t('common.dashboard')}</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('chat.title')} ({isPlaymate ? t('dial.playmate') : activeRole})</h1>
        </header>
       )}

      <div className="flex-grow bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-4 md:p-6 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
            {messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
            ))}
        </div>
      </div>

      <div className="flex-shrink-0">
        <SmartInput onSendMessage={handleSendMessage} isLoading={isLoading} onListeningStateChange={onListeningStateChange} />
      </div>

    </div>
  );
};

export default CompanionView;
