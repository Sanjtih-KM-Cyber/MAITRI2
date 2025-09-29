import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { startListening } from '../../services/voiceService';

const SymptomLogger: React.FC = () => {
    const { t } = useTranslation();
    const [log, setLog] = useState('');
    const [isListening, setIsListening] = useState(false);

    const handleDictate = useCallback(() => {
        if (isListening) return;

        setIsListening(true);
        const stopListening = startListening(
            (finalTranscript) => {
                setLog(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
                setIsListening(false);
            },
            (interimTranscript) => {
                // Could show interim results if desired
            }
        );

        // Stop listening after a timeout if user stops talking
        setTimeout(() => {
            stopListening();
            if(isListening) setIsListening(false);
        }, 5000);
    }, [isListening]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!log.trim()) return;
        console.log("Symptom Logged:", log);
        // Here you would typically send the log to a medical database
        alert("Symptom logged successfully.");
        setLog('');
    }

    return (
        <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-6">
            <h3 className="text-xl font-semibold text-primary-text mb-4">{t('guardian.symptomLogger.title')}</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={log}
                    onChange={(e) => setLog(e.target.value)}
                    placeholder={t('guardian.symptomLogger.placeholder')}
                    className="w-full h-24 bg-background/50 rounded-lg p-3 border border-widget-border focus:ring-2 focus:ring-primary-accent focus:outline-none transition-shadow"
                    aria-label="Symptom description"
                />
                <div className="flex justify-end items-center mt-3 space-x-4">
                    <button
                        type="button"
                        onClick={handleDictate}
                        aria-label="Dictate symptom"
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-white ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary-accent hover:opacity-90'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 3a1 1 0 00-2 0v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 9.586V7z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a7 7 0 007-7h-2a5 5 0 01-5 5 5 5 0 01-5-5H3a7 7 0 007 7z" clipRule="evenodd" />
                        </svg>
                        {isListening ? t('guardian.symptomLogger.listening') : t('guardian.symptomLogger.dictate')}
                    </button>
                    <button
                        type="submit"
                        disabled={!log.trim()}
                        className="px-4 py-2 bg-widget-background border border-widget-border rounded-lg hover:bg-primary-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('guardian.symptomLogger.logSymptom')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SymptomLogger;