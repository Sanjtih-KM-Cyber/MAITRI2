import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Message } from '../types';
import MessageBubble from '../components/chat/MessageBubble';
import SmartInput from '../components/chat/SmartInput';
import { getChatResponseStream } from '../services/localAIService';
import { useTheme } from '../context/ThemeContext';

interface CompanionViewProps {
  setView?: (view: View) => void;
  systemPrompt?: string; // Optional prompt to set AI persona
  initialMessage?: string;
}

const CompanionView: React.FC<CompanionViewProps> = ({ setView, systemPrompt, initialMessage }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { accentColor } = useTheme();

  useEffect(() => {
    const initialMessages: Message[] = [];
    if(systemPrompt && initialMessage) {
        initialMessages.push({ role: 'model', text: initialMessage });
    } else {
        initialMessages.push({ role: 'model', text: t('chat.initialMessage') });
    }
    setMessages(initialMessages);
  }, [systemPrompt, initialMessage, t]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = { role: 'user', text: inputText };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    const fullHistory = systemPrompt 
        ? [{ role: 'system', text: systemPrompt }, ...currentMessages] 
        : currentMessages;

    // Add a placeholder for the model's response
    setMessages(prev => [...prev, { role: 'model', text: '...' }]);
    
    try {
      const stream = await getChatResponseStream(fullHistory as Message[]);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkText = decoder.decode(value);

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
      setMessages(prev => {
         const lastMessage = prev[prev.length - 1];
         if (lastMessage?.role === 'model') {
            return [...prev.slice(0, -1), { ...lastMessage, text: t('chat.errorMessage') }];
         }
         return [...prev, { role: 'model', text: t('chat.errorMessage') }];
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt, t]);


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
            {isLoading && messages[messages.length-1].role === 'user' && (
              <MessageBubble message={{role: 'model', text: '...'}} />
            )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <SmartInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

    </div>
  );
};

export default CompanionView;