import React from 'react';
import { useTranslation } from 'react-i18next';

const MissionCadence: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { t } = useTranslation();
    const events = [
        { time: "14:00", title: "EVA Prep" },
        { time: "16:30", title: "Geology Survey" },
        { time: "19:00", title: "System Diagnostics" },
        { time: "21:00", title: "End of Duty" },
    ];

  return (
    <div className={`bg-widget-background border border-widget-border rounded-2xl shadow-glow backdrop-blur-md p-6 ${className}`}>
      <h3 className="font-semibold text-primary-text mb-4">{t('widgets.missionCadence.title')}</h3>
      <ul className="space-y-2">
        {events.map(event => (
            <li key={event.time} className="flex justify-between text-sm">
                <span className="text-secondary-text">{event.time}</span>
                <span className="text-primary-text">{event.title}</span>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default MissionCadence;