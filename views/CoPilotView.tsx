import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import ProcedureAssistant from '../components/copilot/ProcedureAssistant';
import { useMissionData } from '../hooks/useMissionData';
import CompanionView from './CompanionView';

interface CoPilotViewProps {
  setView: (view: View) => void;
}

const CoPilotView: React.FC<CoPilotViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const { procedureChecklist, isLoading } = useMissionData();
  const [isChatListening, setIsChatListening] = useState(false);

  return (
    <div className="h-full w-full p-4 md:p-8 animate-fadeIn flex flex-col">
      <header className="grid grid-cols-3 items-center mb-4 md:mb-8 flex-shrink-0">
        <div className="justify-self-start">
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
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-primary-text justify-self-center text-center">{t('views.coPilot.title')}</h1>
        
        <div className="justify-self-end">
             {/* Placeholder for potential future controls */}
        </div>
      </header>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        <div className="lg:col-span-2 bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-4 md:p-8 flex items-center justify-center overflow-y-auto">
          <ProcedureAssistant checklist={procedureChecklist} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1 flex flex-col h-full overflow-hidden">
           <CompanionView 
             onListeningStateChange={setIsChatListening}
             initialMessage={t('coPilot.initialMessage')}
            />
        </div>
      </div>
    </div>
  );
};

export default CoPilotView;
