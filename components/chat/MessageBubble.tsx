import React from 'react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { text, role } = message;
  const isUser = role === 'user';

  // Handling for loading '...' state
  const isLoading = text === '...';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
          isUser 
          ? 'bg-primary-accent text-white rounded-br-none' 
          : 'bg-widget-background text-primary-text rounded-bl-none'
      }`}>
        {isLoading ? (
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-secondary-text rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-secondary-text rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-secondary-text rounded-full animate-pulse"></div>
            </div>
        ) : (
             <p className="text-base whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;