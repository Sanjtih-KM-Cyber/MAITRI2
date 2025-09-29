import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import CompanionView from './CompanionView';

interface PlaymateViewProps {
  setView: (view: View) => void;
}

const gameMasterPrompt = `You are MAITRI, acting as the Game Master for an interactive, text-based RPG called "Cosmic Chronicles". The user is an astronaut on a long-duration mission. Your goal is to create an engaging, imaginative, and collaborative storytelling experience. 

- Start by presenting the user with an intriguing scenario on a newly discovered planet, a mysterious space station, or a strange cosmic anomaly.
- Describe the scene vividly. Use sensory details.
- Always end your response by presenting the user with 2-3 clear choices or asking them what they want to do.
- Keep the tone adventurous and slightly mysterious.
- Remember the user's previous choices and weave them into the ongoing narrative.`;

const PlaymateView: React.FC<PlaymateViewProps> = ({ setView }) => {
  const { t } = useTranslation();

  return (
    <div className="h-full w-full p-8 animate-fadeIn flex flex-col">
      <header className="flex items-center mb-8 flex-shrink-0">
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
        <h1 className="text-3xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('views.playmate.title')}</h1>
      </header>
      <div className="flex-grow flex flex-col">
        <CompanionView 
          systemPrompt={gameMasterPrompt}
          initialMessage={t('playmate.initialMessage')}
        />
      </div>
    </div>
  );
};

export default PlaymateView;