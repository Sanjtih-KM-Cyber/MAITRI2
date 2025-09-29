// src/views/StorytellerView.tsx

import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import DigitalDiary from '../components/storyteller/DigitalDiary';
import { useLocalMediaStore } from '../hooks/useLocalMediaStore';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

// NEW: Sanctuary Modal Component
const SanctuaryModal: React.FC<{ onClose: () => void; onActivate: () => void; }> = ({ onClose, onActivate }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn" onClick={onClose}>
            <div className="bg-widget-background border-2 border-primary-accent rounded-2xl shadow-glow p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-primary-text mb-4">{t('storyteller.sanctuary.title')}</h2>
                <p className="text-secondary-text mb-6">{t('storyteller.sanctuary.prompt')}</p>
                <textarea
                    placeholder="e.g., Sitting by a fireplace in a cabin during a gentle rainstorm..."
                    className="w-full h-24 bg-background/50 rounded-lg p-3 border border-widget-border focus:ring-2 focus:ring-primary-accent focus:outline-none transition-shadow"
                />
                <div className="flex justify-end mt-6 space-x-4">
                    <button onClick={onClose} className="px-6 py-2 bg-widget-background border border-widget-border rounded-lg hover:bg-primary-accent/20 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onActivate} className="px-6 py-2 bg-primary-accent text-white rounded-lg hover:opacity-90 transition-opacity">
                        {t('storyteller.sanctuary.activate')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const StorytellerView: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
  const { t } = useTranslation();
  const { listLogEntries, startVideoRecording } = useLocalMediaStore();
  const { setSanctuaryActive } = useTheme(); // Get theme controller
  const [isRecording, setIsRecording] = useState(false);
  const [isSanctuaryModalOpen, setIsSanctuaryModalOpen] = useState(false);
  const [isSanctuaryMode, setIsSanctuaryMode] = useState(false);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  const videoLogs = listLogEntries('video_meta');

  const handleToggleRecord = useCallback(() => {
    if (isRecording) {
        stopRecordingRef.current?.();
    } else {
        setIsRecording(true);
        stopRecordingRef.current = startVideoRecording(() => setIsRecording(false));
    }
  }, [isRecording, startVideoRecording]);
  
  const handleActivateSanctuary = () => {
      setIsSanctuaryModalOpen(false);
      setIsSanctuaryMode(true);
      setSanctuaryActive(true);
  };
  
  const handleToggleSanctuary = () => {
      if (isSanctuaryMode) {
          setIsSanctuaryMode(false);
          setSanctuaryActive(false);
      } else {
          setIsSanctuaryModalOpen(true);
      }
  }

  return (
    <>
      {isSanctuaryModalOpen && <SanctuaryModal onClose={() => setIsSanctuaryModalOpen(false)} onActivate={handleActivateSanctuary} />}
      <div className="h-full w-full p-8 animate-fadeIn flex flex-col">
        <header className="flex items-center mb-8 flex-shrink-0">
          <button onClick={() => setView('dashboard')} aria-label={t('common.backToDashboard')} className="flex items-center text-primary-accent hover:text-primary-text transition-colors duration-200 p-2 rounded-lg -ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="text-lg font-medium hidden md:block">{t('common.dashboard')}</span>
          </button>
          <h1 className="text-3xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('views.storyteller.title')}</h1>
        </header>
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pb-8">
          <div className="lg:col-span-2">
              <DigitalDiary />
          </div>
          <div className="lg:col-span-1 flex flex-col space-y-6">
               <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6">
                  <h3 className="text-xl font-semibold text-primary-text mb-4">Family Video Link (3.3.1)</h3>
                  <button
                      onClick={handleToggleRecord}
                      className={`w-full py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center space-x-2 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-primary-accent hover:bg-primary-accent/80'}`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                      <span>{isRecording ? t('storyteller.digitalDiary.stopRecording') : t('storyteller.digitalDiary.recordLog')}</span>
                  </button>
                  <h4 className="mt-6 text-lg font-semibold text-primary-text">Saved Videos ({videoLogs.length})</h4>
                  <ul className="mt-2 text-secondary-text text-sm max-h-40 overflow-y-auto space-y-1">
                      {videoLogs.length > 0 ? videoLogs.map(log => (
                          <li key={log.id} className="flex justify-between items-center bg-background/50 p-2 rounded-md">
                              <span>{log.data.preview}</span>
                              <span className="text-primary-accent">{log.data.duration}</span>
                          </li>
                      )) : <li className="text-center italic">No videos saved locally.</li>}
                  </ul>
              </div>
              
              <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6">
                  <h3 className="text-xl font-semibold text-primary-text mb-4">Sensory Immersion (3.3.3)</h3>
                  <p className="text-secondary-text">Describe a memory to generate a soundscape and theme.</p>
                  <button onClick={handleToggleSanctuary} className={`mt-3 w-full py-2 rounded-lg transition-colors ${isSanctuaryMode ? 'bg-red-500/80 text-white hover:bg-red-500' : 'bg-primary-accent/20 text-primary-accent hover:bg-primary-accent hover:text-white'}`}>
                    {isSanctuaryMode ? t('storyteller.sanctuary.deactivate') : t('storyteller.sanctuary.activate')}
                  </button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StorytellerView;
