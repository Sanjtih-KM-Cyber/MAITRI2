import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { startListening, speak, cancelSpeech } from '../../services/voiceService';
import { useSettings } from '../../context/SettingsContext';
import { MissionChecklist } from '../../../types';

interface ProcedureAssistantProps {
    checklist: MissionChecklist | null;
    isLoading: boolean;
}

const ProcedureAssistant: React.FC<ProcedureAssistantProps> = ({ checklist, isLoading }) => {
  const { t } = useTranslation();
  const { coPilotVoice } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  
  const step = checklist?.steps[currentStep];
  const isLastStep = checklist ? currentStep === checklist.steps.length - 1 : false;

  const advanceStep = useCallback(() => {
    if (!checklist || isLastStep) {
        if(isLastStep) speak("Procedure complete.", coPilotVoice);
        return;
    }
    
    setCurrentStep(prev => prev + 1);
    const nextStep = checklist.steps[currentStep + 1];
    speak(`Next step: ${nextStep.title}. ${nextStep.instruction}`, coPilotVoice);

  }, [currentStep, isLastStep, checklist, coPilotVoice]);
  
  const resetProcedure = () => {
      if (!checklist) return;
      setCurrentStep(0);
      const firstStep = checklist.steps[0];
      speak(`Restarting procedure: ${checklist.title}. First step: ${firstStep.title}. ${firstStep.instruction}`, coPilotVoice);
  }

  // Effect to announce the procedure once it's loaded
  useEffect(() => {
    if (checklist) {
      setCurrentStep(0); // Reset step when checklist changes
      const firstStep = checklist.steps[0];
      speak(`Procedure loaded: ${checklist.title}. First step: ${firstStep.title}. ${firstStep.instruction}`, coPilotVoice);
    }
    return () => cancelSpeech(); // Stop speech if component unmounts
  }, [checklist, coPilotVoice]);

  // Effect for voice command listening
  useEffect(() => {
    if(isLastStep || !checklist || !step) return;

    setIsListening(true);
    const handleVoiceResult = (transcript: string) => {
        setIsListening(false);
        if (transcript.toLowerCase().includes('confirm')) {
            console.log('Confirmation received');
            advanceStep();
        } else if (transcript.toLowerCase().includes('repeat')){
             speak(`Repeating step: ${step.title}. ${step.instruction}`, coPilotVoice);
        }
    };

    const stopListening = startListening(
      handleVoiceResult, 
      () => {},
      { continuous: false }
    );
    
    return () => {
        cancelSpeech();
        stopListening();
        setIsListening(false);
    };

  }, [currentStep, advanceStep, step, isLastStep, checklist, coPilotVoice]);


  if (isLoading) {
    return (
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold text-secondary-text mb-2 animate-pulse">{t('coPilot.procedureAssistant.loading')}</h2>
      </div>
    );
  }

  if (!checklist || !step) {
    return (
       <div className="w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold text-secondary-text mb-2">{t('coPilot.procedureAssistant.noData')}</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-xl font-semibold text-secondary-text mb-2">{checklist.title}</h2>
      <p className="text-lg text-secondary-text mb-6">{t('coPilot.procedureAssistant.step', { current: currentStep + 1, total: checklist.steps.length })}</p>
      
      <div className="bg-background/50 p-8 rounded-xl border-2 border-primary-accent shadow-glow mb-8">
        <h3 className="text-3xl font-bold text-primary-text mb-4">{step.title}</h3>
        <p className="text-xl text-primary-text">{step.instruction}</p>
      </div>
      
      { isListening && !isLastStep &&
        <div className="text-primary-accent font-semibold animate-pulse mb-4">
            {t('coPilot.procedureAssistant.listening')}
        </div>
      }
      
      <div className="flex justify-center space-x-4">
        <button
            onClick={advanceStep}
            disabled={isLastStep}
            className="px-6 py-3 bg-primary-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
            {isLastStep ? t('coPilot.procedureAssistant.procedureComplete') : t('coPilot.procedureAssistant.confirmNext')}
        </button>
        { isLastStep &&
            <button
                onClick={resetProcedure}
                className="px-6 py-3 bg-widget-background border border-widget-border rounded-lg hover:bg-primary-accent hover:text-white transition-colors text-lg font-semibold"
            >
                {t('coPilot.procedureAssistant.reset')}
            </button>
        }
      </div>
    </div>
  );
};

export default ProcedureAssistant;