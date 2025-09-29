import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CadenceItem } from '../../../types';

interface MassProtocolProps {
  workoutPlan: CadenceItem[] | null;
}

const MassProtocol: React.FC<MassProtocolProps> = ({ workoutPlan }) => {
  const [workout, setWorkout] = useState<CadenceItem[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if(workoutPlan) {
        setWorkout(workoutPlan.map(item => ({...item, completed: false})))
    }
  }, [workoutPlan]);

  const toggleComplete = (id: string) => {
    setWorkout(
      workout.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const completionPercentage = workout.length > 0 ? (workout.filter(item => item.completed).length / workout.length) * 100 : 0;

  if (!workoutPlan) {
      return (
        <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6">
            <h3 className="text-xl font-semibold text-primary-text mb-4">{t('guardian.massProtocol.title')}</h3>
            <p className="text-secondary-text">{t('coPilot.procedureAssistant.noData')}</p>
        </div>
      )
  }

  return (
    <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6">
      <h3 className="text-xl font-semibold text-primary-text mb-4">{t('guardian.massProtocol.title')}</h3>
      <div className="mb-4">
        <div className="w-full bg-background/50 rounded-full h-2.5">
            <div className="bg-primary-accent h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
        </div>
        <p className="text-right text-sm text-secondary-text mt-1">{t('guardian.massProtocol.complete', {percentage: completionPercentage.toFixed(0)})}</p>
      </div>
      <ul className="space-y-3">
        {workout.map(item => (
          <li
            key={item.id}
            onClick={() => toggleComplete(item.id)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${item.completed ? 'bg-primary-accent/30' : 'bg-background/50 hover:bg-background'}`}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-4 border ${item.completed ? 'bg-primary-accent border-primary-accent' : 'border-widget-border'}`}>
                {item.completed && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-lg ${item.completed ? 'line-through text-secondary-text' : 'text-primary-text'}`}>
                {item.name}
              </span>
            </div>
            <span className="text-secondary-text">{item.duration || item.sets}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MassProtocol;
