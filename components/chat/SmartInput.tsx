import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { startListening } from '../../services/voiceService';

interface SmartInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onListeningStateChange?: (isListening: boolean) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({ onSendMessage, isLoading, onListeningStateChange }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { t } = useTranslation();
  const stopListeningRef = useRef<() => void>(() => {});

  useEffect(() => {
    onListeningStateChange?.(isListening);
  }, [isListening, onListeningStateChange]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListeningRef.current();
      setIsListening(false);
    } else {
      setIsListening(true);
      const initialText = input.trim();
      
      stopListeningRef.current = startListening(
        (finalTranscript) => {
          setInput((initialText ? initialText + ' ' : '') + finalTranscript);
          setIsListening(false);
        },
        (interimTranscript) => {
          setInput((initialText ? initialText + ' ' : '') + interimTranscript);
        }
      );
    }
  }, [isListening, input]);

  useEffect(() => {
    return () => {
        stopListeningRef.current();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListeningRef.current();
      setIsListening(false);
    }
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-widget-background border border-widget-border rounded-xl backdrop-blur-md p-2 mt-4">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? t('chat.listening') : (isLoading ? t('chat.inputPlaceholderLoading') : t('chat.inputPlaceholder'))}
          className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-primary-text placeholder-secondary-text px-4 py-2"
          aria-label="Chat input"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleMicClick}
          aria-label={isListening ? t('chat.stopListening') : t('chat.startListening')}
          className={`p-2 rounded-lg transition-colors duration-200 mr-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-primary-accent hover:bg-primary-accent/20'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button
          type="submit"
          aria-label={t('chat.sendMessage')}
          className="bg-primary-accent text-white rounded-lg p-2 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!input.trim() || isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SmartInput;
