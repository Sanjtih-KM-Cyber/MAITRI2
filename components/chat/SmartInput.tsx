import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SmartInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SmartInput: React.FC<SmartInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          placeholder={isLoading ? t('chat.inputPlaceholderLoading') : t('chat.inputPlaceholder')}
          className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-primary-text placeholder-secondary-text px-4 py-2"
          aria-label="Chat input"
          disabled={isLoading}
        />
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