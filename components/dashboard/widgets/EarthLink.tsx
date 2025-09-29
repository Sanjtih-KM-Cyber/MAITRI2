import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const EarthLink: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [secondsRemaining, setSecondsRemaining] = useState(4 * 3600 + 12 * 60 + 30);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const intervalId = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsRemaining]);

  const formatTime = (totalSeconds: number): string => {
    if (totalSeconds <= 0) {
        return t('widgets.earthLink.uplinkActive');
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
  };

  return (
    <div className={`bg-widget-background border border-widget-border rounded-2xl shadow-glow backdrop-blur-md p-6 flex flex-col items-center justify-center text-center ${className}`}>
        <div className="text-primary-accent mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.884 11H16.116M7.884 11L7.884 7.884m8.232 3.116L16.116 7.884m0 0L12 5.75l-4.116 2.134M12 21.25a9.25 9.25 0 100-18.5 9.25 9.25 0 000 18.5z" />
            </svg>
        </div>
        <h3 className="font-semibold text-primary-text">{t('widgets.earthLink.title')}</h3>
        <p className="text-lg text-secondary-text font-mono tracking-wider mt-2">
            {formatTime(secondsRemaining)}
        </p>
    </div>
  );
};

export default EarthLink;