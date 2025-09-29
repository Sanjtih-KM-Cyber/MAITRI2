// src/views/StorytellerView.tsx (MODIFIED for Video Log and Media Features)

import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import DigitalDiary from '../components/storyteller/DigitalDiary';
import { useLocalMediaStore } from '../hooks/useLocalMediaStore'; // NEW

interface StorytellerViewProps {
  setView: (view: View) => void;
}

const StorytellerView: React.FC<StorytellerViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const { listLogEntries, startVideoRecording } = useLocalMediaStore(); // NEW
  const [isRecording, setIsRecording] = useState(false);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  const videoLogs = listLogEntries('video_meta');

  const handleToggleRecord = useCallback(() => {
    if (isRecording) {
        stopRecordingRef.current?.();
        setIsRecording(false);
    } else {
        setIsRecording(true);
        // Start recording and get the stop function
        stopRecordingRef.current = startVideoRecording();
    }
  }, [isRecording, startVideoRecording]);


  return (
    <div className="h-full w-full p-8 animate-fadeIn flex flex-col">
      <header className="flex items-center mb-8 flex-shrink-0">
        <button
          onClick={() => setView('dashboard')}
          aria-label={t('common.backToDashboard')}
          className="flex items-center text-primary-accent hover:text-primary-text transition-colors duration-200 p-2 rounded-lg -ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-lg font-medium hidden md:block">{t('common.dashboard')}</span>
        </button>
        <h1 className="text-3xl font-bold text-primary-text mx-auto pr-16 md:pr-24">{t('views.storyteller.title')}</h1>
      </header>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pb-8">
        
        {/* Digital Diary Widget (2/3 width) */}
        <div className="lg:col-span-2">
            <DigitalDiary />
        </div>

        {/* Video Log / Sensory Immersion Panel (1/3 width) */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
             <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6">
                <h3 className="text-xl font-semibold text-primary-text mb-4">Family Video Link (3.3.1)</h3>
                
                {/* Recording Status */}
                <button
                    onClick={handleToggleRecord}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center space-x-2 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-primary-accent hover:bg-primary-accent/80'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span>{isRecording ? t('storyteller.digitalDiary.stopRecording') : t('storyteller.digitalDiary.recordLog')}</span>
                </button>
                
                <h4 className="mt-6 text-lg font-semibold text-primary-text">Saved Videos ({videoLogs.length})</h4>
                <ul className="mt-2 text-secondary-text text-sm max-h-40 overflow-y-auto space-y-1">
                    {videoLogs.map(log => (
                        <li key={log.id} className="flex justify-between items-center bg-background/50 p-2 rounded-md">
                            <span>{log.data.preview}</span>
                            <span className="text-primary-accent">{log.data.duration}</span>
                        </li>
                    ))}
                    {videoLogs.length === 0 && <li className="text-center italic">No videos saved locally.</li>}
                </ul>
            </div>
            
            {/* Sensory Immersion Module (3.3.3) */}
            <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6">
                <h3 className="text-xl font-semibold text-primary-text mb-4">Sensory Immersion (3.3.3)</h3>
                <p className="text-secondary-text">Describe a memory to generate a soundscape and theme.</p>
                <button className="mt-3 w-full py-2 bg-primary-accent/20 text-primary-accent rounded-lg hover:bg-primary-accent hover:text-white transition-colors">Activate Sanctuary</button>
            </div>
            
        </div>
      </div>
    </div>
  );
};

export default StorytellerView;
