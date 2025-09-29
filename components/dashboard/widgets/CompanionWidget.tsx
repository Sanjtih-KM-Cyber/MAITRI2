import React from 'react';
import { useTranslation } from 'react-i18next';

interface CompanionWidgetProps {
  onClick: () => void;
  className?: string;
}

const CompanionWidget: React.FC<CompanionWidgetProps> = ({ onClick, className = '' }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-widget-background border border-widget-border rounded-2xl shadow-glow backdrop-blur-md p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] cursor-pointer flex flex-col items-center justify-center text-center ${className}`}
      onClick={onClick}
    >
      <div className="mb-4 text-primary-accent">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-primary-text mb-2">{t('widgets.companion.title')}</h2>
      <p className="text-secondary-text">{t('widgets.companion.subtitle')}</p>
    </div>
  );
};

export default CompanionWidget;