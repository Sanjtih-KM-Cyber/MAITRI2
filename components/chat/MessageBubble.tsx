import React from 'react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { text, role, timestamp } = message;
  const isUser = role === 'user';

  // Handling for loading '...' state
  const isLoading = text === '...';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
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
             <>
                <p className="text-base whitespace-pre-wrap pb-3">{text}</p>
                {timestamp && (
                    <span className={`text-xs absolute bottom-1.5 right-3 ${isUser ? 'text-white/70' : 'text-secondary-text/70'}`}>
                        {timestamp}
                    </span>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
