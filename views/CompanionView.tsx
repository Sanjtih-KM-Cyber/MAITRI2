import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Message } from '../types';
import MessageBubble from '../components/chat/MessageBubble';
import SmartInput from '../components/chat/SmartInput';
import { getChatResponseStream } from '../services/localAIService';
import { useSettings } from '../context/SettingsContext';
import { getChatHistory, saveChatMessage } from '../services/chatPersistenceService';
// FIX: Import the 'speak' function to enable Text-to-Speech (TTS) for AI responses.
import { speak } from '../services/voiceService';

interface CompanionViewProps {
  setView?: (view: View) => void;
  systemPrompt?: string;
  initialMessage?: string;
  persona: View; // The persona for this chat instance
  onListeningStateChange?: (isListening: boolean) => void;
}

const CompanionView: React.FC<CompanionViewProps> = ({ setView, systemPrompt, initialMessage, persona, onListeningStateChange }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // FIX: Destructure 'coPilotVoice' from settings to select the correct voice for TTS.
  const { isTTSOn, coPilotVoice } = useSettings();

  useEffect(() => {
    const loadHistory = async () => {
        setIsLoading(true);
        const history = await getChatHistory(persona);
        if (history.length > 0) {
            setMessages(history);
        } else {
            const initialText = initialMessage || t('chat.initialMessage');
            setMessages([{ role: 'model', text: initialText }]);
        }
        setIsLoading(false);
    };
    loadHistory();
  }, [persona, initialMessage, t]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage: Message = { role: 'user', text: inputText, timestamp };
    
    // Optimistically update UI
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    // Persist user message
    await saveChatMessage(newUserMessage, persona);

    const historyForAI = currentMessages.map(({ role, text }) => ({ role, text }));
    const fullHistory = systemPrompt 
        ? [{ role: 'system', text: systemPrompt }, ...historyForAI] 
        : historyForAI;

    setMessages(prev => [...prev, { role: 'model', text: '...' }]);
    
    try {
      const stream = await getChatResponseStream(fullHistory as Message[]);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;
      let accumulatedText = '';
      let finalMessage: Message | null = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (isTTSOn) {
            // FIX: Call the imported 'speak' function, passing the appropriate voice setting for the Co-Pilot persona.
            speak(accumulatedText, persona === 'coPilot' ? coPilotVoice : undefined);
          }
          const finalTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          finalMessage = { role: 'model', text: accumulatedText, timestamp: finalTimestamp };

          // Persist the final model message
          await saveChatMessage(finalMessage, persona);

          setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if(lastMessage?.role === 'model' && finalMessage) {
                  return [...prev.slice(0, -1), finalMessage]
              }
              return prev;
          });
          break;
        }
        
        const chunkText = decoder.decode(value);
        accumulatedText += chunkText;

        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'model') {
            const newText = isFirstChunk ? chunkText : lastMessage.text + chunkText;
            isFirstChunk = false;
            return [...prev.slice(0, -1), { ...lastMessage, text: newText.replace('...', '') }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = { role: 'model', text: t('chat.errorMessage') };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      await saveChatMessage(errorMessage, persona);
    } finally {
      setIsLoading(false);
    }
  // FIX: Add 'coPilotVoice' to the dependency array for the 'handleSendMessage' callback.
  }, [messages, systemPrompt, t, isTTSOn, persona, coPilotVoice]);


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
            <h1 className="text-xl md:text-2xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('chat.title')}</h1>
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