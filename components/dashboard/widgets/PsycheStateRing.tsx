import React from 'react';
import { useTranslation } from 'react-i18next';

const PsycheStateRing: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  return (
    <div className={`bg-widget-background border border-widget-border rounded-2xl shadow-glow backdrop-blur-md p-6 flex flex-col items-center justify-center ${className}`}>
        <h3 className="font-semibold text-primary-text mb-4">{t('widgets.psycheState.title')}</h3>
        <div className="relative w-24 h-24">
            <svg className="w-full h-full animate-pulse-glow" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle
                    className="stroke-primary-accent transition-all duration-500"
                    cx="50"
                    cy="50"
                    r="45"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="283"
                    strokeDashoffset="70"
                    transform="rotate(-90 50 50)"
                />
            </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-medium text-primary-text">{t('widgets.psycheState.calm')}</p>
            </div>
        </div>
    </div>
  );
};

export default PsycheStateRing;