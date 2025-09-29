import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import { useTheme } from '../context/ThemeContext';
import CompanionWidget from '../components/dashboard/widgets/CompanionWidget';
import PsycheStateRing from '../components/dashboard/widgets/PsycheStateRing';
import MissionCadence from '../components/dashboard/widgets/MissionCadence';
import EarthLink from '../components/dashboard/widgets/EarthLink';

interface DashboardProps {
  setView: (view: View) => void;
}

const GlassWidget: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className = '' }) => (
  <div
    className={`bg-widget-background border border-widget-border rounded-2xl shadow-glow backdrop-blur-md p-6 ${className}`}
  >
    {children}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { changeAccentColor } = useTheme();
  const { t, i18n } = useTranslation();

  return (
    <div className="h-full w-full p-8 animate-fadeIn flex flex-col">
      <header className="mb-8 flex-shrink-0">
        <h1 className="text-4xl font-bold text-primary-text">{t('dashboard.title')}</h1>
        <p className="text-secondary-text text-lg">{t('dashboard.subtitle')}</p>
        <div className="flex items-center space-x-2 mt-4">
          <button aria-label={t('dashboard.theme.earthrise')} onClick={() => changeAccentColor('#4A90E2')} className="w-6 h-6 rounded-full bg-[#4A90E2] border-2 border-white/50 focus:outline-none focus:ring-2 focus:ring-white"></button>
          <button aria-label={t('dashboard.theme.warning')} onClick={() => changeAccentColor('#E24A4A')} className="w-6 h-6 rounded-full bg-[#E24A4A] border-2 border-white/50 focus:outline-none focus:ring-2 focus:ring-white"></button>
          <button aria-label={t('dashboard.theme.nominal')} onClick={() => changeAccentColor('#4AE28A')} className="w-6 h-6 rounded-full bg-[#4AE28A] border-2 border-white/50 focus:outline-none focus:ring-2 focus:ring-white"></button>
          
          <div className="border-l border-widget-border h-6 mx-2"></div>

          <button onClick={() => i18n.changeLanguage('en')} className={`px-3 py-1 text-sm rounded-md ${i18n.language === 'en' ? 'bg-primary-accent text-white' : 'bg-widget-background'}`}>{t('dashboard.language.en')}</button>
          <button onClick={() => i18n.changeLanguage('hi')} className={`px-3 py-1 text-sm rounded-md ${i18n.language === 'hi' ? 'bg-primary-accent text-white' : 'bg-widget-background'}`}>{t('dashboard.language.hi')}</button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 flex-grow overflow-y-auto pb-8">
        <CompanionWidget onClick={() => setView('chat')} className="md:col-span-2 lg:col-span-2" />
        <PsycheStateRing />
        <MissionCadence />
        <EarthLink />
        <GlassWidget className="lg:col-span-2">
            <h3 className="font-semibold text-primary-text">{t('widgets.systemStatus.title')}</h3>
            <p className="text-secondary-text">{t('widgets.systemStatus.nominal')}</p>
        </GlassWidget>
         <GlassWidget>
            <h3 className="font-semibold text-primary-text">{t('widgets.powerLevels.title')}</h3>
            <p className="text-secondary-text">{t('widgets.powerLevels.levels')}</p>
        </GlassWidget>
      </div>
    </div>
  );
};

export default Dashboard;