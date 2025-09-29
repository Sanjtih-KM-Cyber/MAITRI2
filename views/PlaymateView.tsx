import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import CompanionView from './CompanionView';
import { PLAYMATE_SYSTEM_PROMPT } from '../config/ai_prompts';
import VoiceVideoFeedback from '../components/common/VoiceVideoFeedback';

interface PlaymateViewProps {
  setView: (view: View) => void;
}

const PlaymateView: React.FC<PlaymateViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const [isChatListening, setIsChatListening] = useState(false);

  return (
    <div className="h-full w-full p-4 md:p-8 animate-fadeIn flex flex-col">
      <header className="flex items-center mb-4 md:mb-8 flex-shrink-0">
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
        <h1 className="text-2xl md:text-3xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('views.playmate.title')}</h1>
      </header>
      <div className="flex-grow flex flex-col relative">
        <VoiceVideoFeedback isActive={isChatListening} />
        <CompanionView 
          persona="playmate"
          systemPrompt={PLAYMATE_SYSTEM_PROMPT}
          initialMessage={t('playmate.initialMessage')}
          onListeningStateChange={setIsChatListening}
        />
      </div>
    </div>
  );
};

export default PlaymateView;
