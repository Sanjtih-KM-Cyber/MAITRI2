import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { startListening } from '../../services/voiceService';

interface SymptomLoggerProps {
    onSymptomLogged: (log: { text: string; attachment: string | null }) => void;
}

const SymptomLogger: React.FC<SymptomLoggerProps> = ({ onSymptomLogged }) => {
    const { t } = useTranslation();
    const [log, setLog] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const stopListeningRef = useRef<(() => void) | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const cleanupCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    }, []);

    const startCamera = async () => {
        try {
            cleanupCamera();
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const takePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
            }
            cleanupCamera();
        }
    };

    const handleDictate = useCallback(() => {
        if (isListening) {
            stopListeningRef.current?.();
            setIsListening(false);
        } else {
            setIsListening(true);
            stopListeningRef.current = startListening(
                (finalTranscript) => {
                    setLog(prev => (prev ? `${prev.trim()} ${finalTranscript}` : finalTranscript).trim());
                },
                () => {},
                { continuous: true }
            );
        }
    }, [isListening]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isListening) {
            stopListeningRef.current?.();
            setIsListening(false);
        }
        if(!log.trim()) return;
        
        onSymptomLogged({ text: log, attachment: capturedImage });
        
        setLog('');
        setCapturedImage(null);
        cleanupCamera();
    };

    useEffect(() => {
        return () => {
            cleanupCamera();
            if (isListening) {
                stopListeningRef.current?.();
            }
        };
    }, [cleanupCamera, isListening]);

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

                <div className="mt-4 p-3 bg-background/30 rounded-lg">
                    {isCameraActive && (
                        <div className="flex flex-col items-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full max-w-xs rounded-lg mb-3" />
                            <div className="flex space-x-2">
                                <button type="button" onClick={takePhoto} className="px-4 py-2 bg-green-500 text-white rounded-lg">Capture</button>
                                <button type="button" onClick={cleanupCamera} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Cancel</button>
                            </div>
                        </div>
                    )}
                    {capturedImage && !isCameraActive && (
                        <div className="flex flex-col items-center">
                            <img src={capturedImage} alt="Symptom capture" className="w-full max-w-xs rounded-lg mb-3" />
                            <button type="button" onClick={() => setCapturedImage(null)} className="px-4 py-2 bg-red-500 text-white rounded-lg">Remove Image</button>
                        </div>
                    )}
                    {!isCameraActive && !capturedImage && (
                        <button type="button" onClick={startCamera} className="w-full py-2 bg-primary-accent/20 text-primary-accent rounded-lg hover:bg-primary-accent hover:text-white transition-colors">
                           Add Visual Log
                        </button>
                    )}
                </div>

                <div className="flex justify-end items-center mt-4 space-x-4">
                    <button
                        type="button"
                        onClick={handleDictate}
                        aria-label="Dictate symptom"
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-white ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary-accent hover:opacity-90'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 3a1 1 0 00-2 0v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 9.586V7zM10 18a7 7 0 007-7h-2a5 5 0 01-5 5 5 5 0 01-5-5H3a7 7 0 007 7z" /></svg>
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