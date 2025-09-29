import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { startListening } from '../../services/voiceService';
import { summarizeText, generateNarrative } from '../../services/localAIService';
import VoiceVideoFeedback from '../common/VoiceVideoFeedback';

const DigitalDiary: React.FC = () => {
  const { t } = useTranslation();
  const [entry, setEntry] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const handleDictate = useCallback(() => {
    if (isListening) return;
    setIsListening(true);
    const stopListening = startListening(
      (finalTranscript) => {
        setEntry(prev => (prev ? `${prev.trim()} ${finalTranscript}` : finalTranscript).trim());
        setIsListening(false);
      },
      () => {}
    );
    // Stop after a period of silence
    const timer = setTimeout(() => {
      stopListening();
      if (isListening) setIsListening(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isListening]);

  const handleRecordLog = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setVideoBlobUrl(url);

          // Clean up stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };
        
        recorder.start();
        setIsRecording(true);
        setVideoBlobUrl(null); // Clear previous recording

      } catch (err) {
        console.error("Error accessing media devices.", err);
        alert(t('storyteller.digitalDiary.videoError'));
      }
    }
  }, [isRecording, t]);

  useEffect(() => {
    // Cleanup function to stop media streams and revoke object URLs
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [videoBlobUrl]);


  const handleGenerateLegacy = async () => {
    if (!entry.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
        const narrative = await generateNarrative(entry);
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
        const summary = await summarizeText(entry);
        alert(`Earth Link Message Draft:\n\n"${summary}"\n\n(This would be sent to the comms panel)`);
     } catch(e) {
        console.error(e);
     } finally {
        setIsProcessing(false);
     }
  }

  return (
    <div className="h-full flex flex-col">
      <VoiceVideoFeedback isActive={isListening || isRecording} />
      <h3 className="text-xl font-semibold text-primary-text mb-4">{t('storyteller.digitalDiary.title')}</h3>
      {videoBlobUrl && (
        <div className="mb-4">
            <video src={videoBlobUrl} controls className="w-full rounded-lg" />
        </div>
      )}
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
            <button
                onClick={handleRecordLog}
                className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-secondary-text/50 hover:bg-secondary-text/80'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                {isRecording ? t('storyteller.digitalDiary.stopRecording') : t('storyteller.digitalDiary.recordLog')}
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
