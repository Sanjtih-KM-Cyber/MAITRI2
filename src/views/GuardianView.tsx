// src/views/GuardianView.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, CadenceItem } from '../types';
import MassProtocol from '../components/guardian/MassProtocol';
import SymptomLogger from '../components/guardian/SymptomLogger';
import PomodoroWidget from '../components/widgets/PomodoroWidget';
import { useAppState } from '../context/AppStateContext';
import { useMissionData } from '../hooks/useMissionData';

interface GuardianViewProps {
  setView: (view: View, options?: { initialMessage: string }) => void;
}

const GuardianView: React.FC<GuardianViewProps> = ({ setView }) => {
  const { wellness, videoRef } = useAppState();
  const { status, error } = wellness;
  const { missionCadence } = useMissionData();
  const { t } = useTranslation();
  
  const [activeWorkout, setActiveWorkout] = useState<CadenceItem | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<CadenceItem[]>([]);

  useEffect(() => {
    if (missionCadence) {
      setWorkoutPlan(missionCadence.map(item => ({...item, completed: false})));
    }
  }, [missionCadence]);

  const handleToggleComplete = (id: string) => {
    setWorkoutPlan(
      workoutPlan.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleWorkoutComplete = (workoutId: string) => {
    setWorkoutPlan(plan => plan.map(item => 
      item.id === workoutId ? { ...item, completed: true } : item
    ));
    setTimeout(() => setActiveWorkout(null), 500);
  };

  const handleSymptomLogged = (log: { text: string; attachment: string | null }) => {
    let initialMessage = `The user has logged a new symptom: "${log.text}".`;
    if (log.attachment) {
      initialMessage += ` An image has been attached for medical review.`;
    }
    initialMessage += ` Please provide immediate, calming, and helpful first-aid guidance.`;

    setView('chat', { initialMessage });
  };

  const detectedEmotion = useMemo(() => {
    const stress = wellness.visualStressScore;
    const fatigue = wellness.vocalFatigueScore;

    if (stress > 70 && fatigue > 70) return "Overwhelmed";
    if (stress > 70) return "Stressed";
    if (fatigue > 70) return "Fatigued";
    if (stress < 30 && fatigue < 30) return "Focused";
    return "Nominal";
  }, [wellness.visualStressScore, wellness.vocalFatigueScore]);

  const getStatusColor = (score: number) => {
    if (score > 66) return 'text-red-400';
    if (score > 33) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="h-full w-full p-8 animate-fadeIn flex flex-col">
      <header className="flex items-center mb-8 flex-shrink-0">
        <button onClick={() => setView('dashboard')} aria-label={t('common.backToDashboard')} className="flex items-center text-primary-accent hover:text-primary-text transition-colors duration-200 p-2 rounded-lg -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="text-lg font-medium hidden md:block">{t('common.dashboard')}</span>
        </button>
        <h1 className="text-3xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('views.guardian.title')}</h1>
      </header>
      
      <video ref={videoRef} autoPlay playsInline muted className="absolute w-1 h-1 opacity-0 -z-10" />
      
      {activeWorkout && <PomodoroWidget workout={activeWorkout} onClose={() => setActiveWorkout(null)} onComplete={handleWorkoutComplete} />}

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto pb-8">
        <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-primary-text">{t('views.guardian.psycheStateMatrix')}</h2>
          {status === 'initializing' && <p className="text-secondary-text">{t('views.guardian.sensorsInitializing')}</p>}
          {status === 'error' && <p className="text-red-400">{t('common.error', { message: error })}</p>}
          {status === 'running' && (
            <div className="grid grid-cols-3 gap-6 flex-grow">
              <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-4">
                <p className="text-lg text-secondary-text">{t('views.guardian.stressLevel')}</p>
                <p className={`text-6xl font-bold ${getStatusColor(wellness.visualStressScore)}`}>{wellness.visualStressScore.toFixed(0)}</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-4">
                <p className="text-lg text-secondary-text">{t('views.guardian.fatigueLevel')}</p>
                <p className={`text-6xl font-bold ${getStatusColor(wellness.vocalFatigueScore)}`}>{wellness.vocalFatigueScore.toFixed(0)}</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-4">
                <p className="text-lg text-secondary-text">Detected Emotion</p>
                <p className="text-4xl font-bold text-primary-accent">{detectedEmotion}</p>
              </div>
            </div>
          )}
        </div>

        <SymptomLogger onSymptomLogged={handleSymptomLogged} />
        
        <div className="lg:col-span-2">
            <MassProtocol workoutPlan={workoutPlan} onStartWorkout={setActiveWorkout} onToggleComplete={handleToggleComplete} />
        </div>
      </div>
    </div>
  );
};

export default GuardianView;