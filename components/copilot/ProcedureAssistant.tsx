import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { startListening, speak, cancelSpeech } from '../../services/voiceService';

// Define types for the checklist data for type safety
interface ChecklistStep {
  step: number;
  title: string;
  instruction: string;
}

interface MissionChecklist {
  title: string;
  procedureID: string;
  steps: ChecklistStep[];
}

const ProcedureAssistant: React.FC = () => {
  const { t } = useTranslation();
  const [missionChecklist, setMissionChecklist] = useState<MissionChecklist | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the checklist data when the component mounts
    const loadChecklist = async () => {
      try {
        // The path should be relative to the public/index.html file
        const response = await fetch('/data/missionChecklist.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MissionChecklist = await response.json();
        setMissionChecklist(data);
      } catch (e) {
        console.error("Could not load mission checklist:", e);
        setError(t('coPilot.procedureAssistant.error'));
      }
    };
    loadChecklist();
  }, [t]);

  const step = missionChecklist?.steps[currentStep];
  const isLastStep = missionChecklist ? currentStep === missionChecklist.steps.length - 1 : false;

  const advanceStep = useCallback(() => {
    if (!missionChecklist || isLastStep) {
        if(isLastStep) speak("Procedure complete.");
        return;
    }
    
    setCurrentStep(prev => prev + 1);
    const nextStep = missionChecklist.steps[currentStep + 1];
    speak(`Next step: ${nextStep.title}. ${nextStep.instruction}`);

  }, [currentStep, isLastStep, missionChecklist]);
  
  const resetProcedure = () => {
      if (!missionChecklist) return;
      setCurrentStep(0);
      const firstStep = missionChecklist.steps[0];
      speak(`Restarting procedure: ${missionChecklist.title}. First step: ${firstStep.title}. ${firstStep.instruction}`);
  }

  // Effect to announce the procedure once it's loaded
  useEffect(() => {
    if (missionChecklist) {
      const firstStep = missionChecklist.steps[0];
      speak(`Procedure loaded: ${missionChecklist.title}. First step: ${firstStep.title}. ${firstStep.instruction}`);
    }
    return () => cancelSpeech(); // Stop speech if component unmounts
  }, [missionChecklist]);

  // Effect for voice command listening
  useEffect(() => {
    if(isLastStep || !missionChecklist || !step) return;

    const handleVoiceResult = (transcript: string) => {
        if (transcript.toLowerCase().includes('confirm')) {
            console.log('Confirmation received');
            advanceStep();
        } else if (transcript.toLowerCase().includes('repeat')){
             speak(`Repeating step: ${step.title}. ${step.instruction}`);
        }
        setIsListening(false);
    };

    const stopListening = startListening(handleVoiceResult, () => {});
    const listeningTimeout = setTimeout(() => {
      if (isListening) {
        setIsListening(false);
        stopListening();
      }
    }, 7000); // Listen for 7 seconds

    setIsListening(true);
    
    return () => {
        cancelSpeech(); // Stop any announcement when step changes or unmounts
        stopListening();
        clearTimeout(listeningTimeout);
    };

  }, [currentStep, advanceStep, step, isLastStep, missionChecklist]);


  if (error) {
    return <div className="w-full max-w-2xl text-center text-red-400">{error}</div>
  }

  if (!missionChecklist || !step) {
    return (
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold text-secondary-text mb-2 animate-pulse">{t('coPilot.procedureAssistant.loading')}</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-xl font-semibold text-secondary-text mb-2">{missionChecklist.title}</h2>
      <p className="text-lg text-secondary-text mb-6">{t('coPilot.procedureAssistant.step', { current: currentStep + 1, total: missionChecklist.steps.length })}</p>
      
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