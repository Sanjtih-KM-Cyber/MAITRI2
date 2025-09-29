import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { startListening } from '../../services/voiceService';
import { summarizeText, generateNarrative } from '../../services/localAIService';
import { useAppState } from '../../context/AppStateContext';

const DigitalDiary: React.FC = () => {
  const { t } = useTranslation();
  const [entry, setEntry] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const stopListeningRef = useRef<(() => void) | null>(null);
  // FIX: Import and use AppState to get the wellness score needed by AI services.
  const { wellness } = useAppState();

  const handleDictate = useCallback(() => {
    if (isListening) {
      stopListeningRef.current?.();
      setIsListening(false);
    } else {
      setIsListening(true);
      stopListeningRef.current = startListening(
        (finalTranscript) => {
          setEntry(prev => (prev ? `${prev.trim()} ${finalTranscript}` : finalTranscript).trim());
        },
        () => {},
        { continuous: true }
      );
    }
  }, [isListening]);

  const handleGenerateLegacy = async () => {
    if (!entry.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
        // FIX: Pass the required wellnessScore argument to the generateNarrative function.
        const narrative = await generateNarrative(entry, wellness.combinedWellnessScore);
        setEntry(prev => `${prev}\n\n--- MAITRI Generated Log ---\n${narrative}`);
    } catch(e) {
        console.error(e);
    } finally {
        setIsProcessing(false);
    }
  }

  const handleCreateEarthLink = async () => {
     if (!entry.trim() || isProcessing) return;
     setIsProcessing(true);
     try {
        // FIX: Pass the required wellnessScore argument to the summarizeText function.
        const summary = await summarizeText(entry, wellness.combinedWellnessScore);
        alert(`Earth Link Message Draft:\n\n"${summary}"\n\n(This would be sent to the comms panel)`);
     } catch(e) {
        console.error(e);
     } finally {
        setIsProcessing(false);
     }
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold text-primary-text mb-4">{t('storyteller.digitalDiary.title')}</h3>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder={t('storyteller.digitalDiary.placeholder')}
        className="w-full flex-grow bg-background/50 rounded-lg p-4 border border-widget-border focus:ring-2 focus:ring-primary-accent focus:outline-none transition-shadow text-lg"
        aria-label="Diary entry"
      />
      <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
        <div className="flex space-x-2">
            <button
                onClick={handleDictate}
                className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary-accent hover:opacity-90'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 3a1 1 0 00-2 0v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 9.586V7zM10 18a7 7 0 007-7h-2a5 5 0 01-5 5 5 5 0 01-5-5H3a7 7 0 007 7z" /></svg>
                {isListening ? t('storyteller.digitalDiary.listening') : t('storyteller.digitalDiary.dictate')}
            </button>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={handleGenerateLegacy} 
                disabled={!entry.trim() || isProcessing}
                className="px-4 py-2 bg-widget-background border border-widget-border rounded-lg hover:bg-primary-accent/50 transition-colors disabled:opacity-50"
            >
                {isProcessing ? t('storyteller.digitalDiary.generating') : t('storyteller.digitalDiary.generateLegacyLog')}
            </button>
            <button 
                onClick={handleCreateEarthLink} 
                disabled={!entry.trim() || isProcessing}
                className="px-4 py-2 bg-widget-background border border-widget-border rounded-lg hover:bg-primary-accent/50 transition-colors disabled:opacity-50"
            >
                {isProcessing ? t('storyteller.digitalDiary.summarizing') : t('storyteller.digitalDiary.createEarthLink')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalDiary;
