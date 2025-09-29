import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMissionData } from '../../../hooks/useMissionData';

const MissionCadence: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { t } = useTranslation();
    const { missionCadence, isLoading } = useMissionData();

  return (
    <div className={`bg-widget-background border border-widget-border rounded-2xl shadow-glow backdrop-blur-md p-6 ${className}`}>
      <h3 className="font-semibold text-primary-text mb-4">{t('widgets.missionCadence.title')}</h3>
      {isLoading ? (
          <p className="text-secondary-text text-sm">{t('common.loading')}</p>
      ) : missionCadence && missionCadence.length > 0 ? (
        <ul className="space-y-2">
            {missionCadence.map((event, index) => (
                <li key={index} className="flex justify-between text-sm">
                    <span className="text-secondary-text">{event.time}</span>
                    <span className="text-primary-text">{event.title}</span>
                </li>
            ))}
        </ul>
      ) : (
        <p className="text-secondary-text text-sm">{t('coPilot.procedureAssistant.noData')}</p>
      )}
    </div>
  );
};

export default MissionCadence;
