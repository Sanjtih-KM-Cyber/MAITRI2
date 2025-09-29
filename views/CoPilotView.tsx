import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import ProcedureAssistant from '../components/copilot/ProcedureAssistant';

interface CoPilotViewProps {
  setView: (view: View) => void;
}

const CoPilotView: React.FC<CoPilotViewProps> = ({ setView }) => {
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
        <h1 className="text-3xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('views.coPilot.title')}</h1>
      </header>
      <div className="flex-grow bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-8 flex items-center justify-center">
        <ProcedureAssistant />
      </div>
    </div>
  );
};

export default CoPilotView;