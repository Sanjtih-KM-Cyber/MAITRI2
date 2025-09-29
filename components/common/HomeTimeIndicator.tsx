import React from 'react';
import { useHomeTime } from '../../hooks/useHomeTime';
import { useSettings } from '../../context/SettingsContext';

// SVG Icons
const DawnIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="8.8"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="8.8" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>
);
const MorningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);
const DuskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="8.8"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="8.8" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="16 5 12 9 8 5"/></svg>
);
const NightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);

const HomeTimeIndicator: React.FC = () => {
  const { homeTime, timeOfDay } = useHomeTime();
  const { homeTimeZone } = useSettings();

  const renderIcon = () => {
    switch (timeOfDay) {
      case 'dawn': return <DawnIcon />;
      case 'morning':
      case 'afternoon': return <MorningIcon />;
      case 'dusk': return <DuskIcon />;
      case 'night': return <NightIcon />;
      default: return null;
    }
  };

  const timeString = homeTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: homeTimeZone,
  });

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-widget-background/80 border border-widget-border rounded-lg shadow-glow p-2 backdrop-blur-md flex items-center space-x-2 text-primary-text animate-fadeIn">
      <div className="text-secondary-text">
        {renderIcon()}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs font-semibold text-secondary-text uppercase">Home Time</span>
        <span className="text-sm font-mono">{timeString}</span>
      </div>
    </div>
  );
};

export default HomeTimeIndicator;
