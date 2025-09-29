import React from 'react';
import { useTranslation } from 'react-i18next';
import { CadenceItem } from '../../types';

interface MassProtocolProps {
  workoutPlan: CadenceItem[];
  onStartWorkout: (workout: CadenceItem) => void;
  onToggleComplete: (id: string) => void;
}

const MassProtocol: React.FC<MassProtocolProps> = ({ workoutPlan, onStartWorkout, onToggleComplete }) => {
  const { t } = useTranslation();

  const completionPercentage = workoutPlan.length > 0 ? (workoutPlan.filter(item => item.completed).length / workoutPlan.length) * 100 : 0;

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
            <div className="bg-primary-accent h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
        </div>
        <p className="text-right text-sm text-secondary-text mt-1">{t('guardian.massProtocol.complete', {percentage: completionPercentage.toFixed(0)})}</p>
      </div>
      <ul className="space-y-3">
        {workoutPlan.map(item => (
          <li
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${item.completed ? 'bg-primary-accent/30' : 'bg-background/50'}`}
          >
            <div className="flex items-center" onClick={() => onToggleComplete(item.id)}>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-4 border cursor-pointer ${item.completed ? 'bg-primary-accent border-primary-accent' : 'border-widget-border'}`}>
                {item.completed && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-lg cursor-pointer ${item.completed ? 'line-through text-secondary-text' : 'text-primary-text'}`}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-secondary-text w-16 text-right">{item.duration || item.sets}</span>
                <button
                    onClick={() => onStartWorkout(item)}
                    disabled={!item.duration}
                    className="px-4 py-1 bg-primary-accent/80 text-white rounded-lg hover:bg-primary-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold"
                >
                    Start
                </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MassProtocol;