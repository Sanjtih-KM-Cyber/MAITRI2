import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Message, CadenceItem } from '../types';
import ProcedureAssistant from '../components/copilot/ProcedureAssistant';
import { useMissionData } from '../hooks/useMissionData';
import MessageBubble from '../components/chat/MessageBubble';
import SmartInput from '../components/chat/SmartInput';
import { runCoPilotMAITRI } from '../services/localAIService';
import { useSettings } from '../context/SettingsContext';
import { useAppState } from '../context/AppStateContext';
import { speak } from '../services/voiceService';

interface CoPilotViewProps {
  setView: (view: View) => void;
}

const NotificationBanner: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-primary-accent/80 backdrop-blur-md text-white p-3 rounded-b-lg shadow-lg z-50 flex justify-between items-center animate-fadeIn">
        <span>{message}</span>
        <button onClick={onDismiss} className="text-white hover:bg-white/20 rounded-full p-1">&times;</button>
    </div>
);


const CoPilotView: React.FC<CoPilotViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const { procedureChecklist, missionCadence, isLoading: isDataLoading } = useMissionData();
  const { isTTSOn, coPilotVoice } = useSettings();
  const { wellness } = useAppState();

  const [messages, setMessages] = useState<Message[]>([{ role: 'model', text: t('coPilot.initialMessage') }]);
  const [tomorrowsCadence, setTomorrowsCadence] = useState<CadenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notifiedEventRef = React.useRef<Set<string>>(new Set());
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Proactive Notification Logic
  useEffect(() => {
    const checkSchedule = () => {
        if (!missionCadence) return;

        const now = new Date();
        const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

        for (const event of missionCadence) {
            if (!event.time || notifiedEventRef.current.has(event.id)) continue;
            
            const [hours, minutes] = event.time.split(':').map(Number);
            const eventTime = new Date();
            eventTime.setHours(hours, minutes, 0, 0);

            if (eventTime > now && eventTime <= tenMinutesFromNow) {
                const notificationMessage = `Upcoming event in ${Math.round((eventTime.getTime() - now.getTime()) / 60000)} minutes: ${event.title}`;
                setNotification(notificationMessage);
                if (isTTSOn) {
                    speak(notificationMessage, coPilotVoice);
                }
                notifiedEventRef.current.add(event.id);
                break; 
            }
        }
    };
    
    const intervalId = setInterval(checkSchedule, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [missionCadence, isTTSOn, coPilotVoice]);


  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage: Message = { role: 'user', text: inputText, timestamp };
    
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    
    try {
      const historyForAI = currentMessages.filter(m => m.role !== 'system');
      setMessages(prev => [...prev, { role: 'model', text: '...' }]);
      
      const aiResponseText = await runCoPilotMAITRI(historyForAI, inputText, wellness.combinedWellnessScore);

      let conversationalResponse = aiResponseText;
      
      if (aiResponseText.startsWith('JSON:')) {
        const parts = aiResponseText.split('\n');
        const jsonLine = parts[0];
        conversationalResponse = parts.slice(1).join('\n').trim();
        try {
          const jsonString = jsonLine.substring('JSON:'.length);
          const parsed = JSON.parse(jsonString);
          if (parsed.task && parsed.task.title && parsed.task.time) {
            const newItem: CadenceItem = {
              id: `cad-tomorrow-${Date.now()}`,
              time: parsed.task.time,
              title: parsed.task.title,
              name: parsed.task.title,
            };
            setTomorrowsCadence(prev => [...prev, newItem]);
          }
        } catch (e) {
          console.error("Failed to parse cadence JSON from AI response:", e);
        }
      }

      const finalTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const finalMessage: Message = { role: 'model', text: conversationalResponse, timestamp: finalTimestamp };

      setMessages(prev => [...prev.slice(0, -1), finalMessage]);

      if (isTTSOn) {
        speak(conversationalResponse, coPilotVoice); 
      }
      
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = { role: 'model', text: t('services.localAI.connectionError') };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, wellness.combinedWellnessScore, isTTSOn, coPilotVoice, t]);


  return (
    <div className="h-full w-full p-4 md:p-8 animate-fadeIn flex flex-col relative">
      {notification && (
        <NotificationBanner 
            message={notification} 
            onDismiss={() => setNotification(null)}
        />
      )}
      <header className="grid grid-cols-3 items-center mb-4 md:mb-8 flex-shrink-0">
        <div className="justify-self-start">
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
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-primary-text justify-self-center text-center">{t('views.coPilot.title')}</h1>
        
        <div className="justify-self-end"></div>
      </header>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        
        <div className="lg:col-span-1 flex flex-col gap-8 overflow-y-auto">
            <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-4 md:p-6 flex-grow flex items-center justify-center">
              <ProcedureAssistant checklist={procedureChecklist} isLoading={isDataLoading} />
            </div>
            <div className="bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-4 md:p-6">
                <h3 className="font-semibold text-primary-text mb-4">Tomorrow's Cadence</h3>
                <div className="max-h-48 overflow-y-auto">
                    {tomorrowsCadence.length > 0 ? (
                        <ul className="space-y-2">
                            {tomorrowsCadence.map((event) => (
                                <li key={event.id} className="flex justify-between text-sm">
                                    <span className="text-secondary-text">{event.time}</span>
                                    <span className="text-primary-text">{event.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-secondary-text text-sm text-center italic">No events scheduled for tomorrow.</p>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
            <div className="flex-grow bg-widget-background/50 border border-widget-border rounded-2xl shadow-inner backdrop-blur-md p-4 md:p-6 flex flex-col overflow-hidden">
                <div ref={scrollRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0">
                <SmartInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default CoPilotView;
