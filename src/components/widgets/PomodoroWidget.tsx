import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CadenceItem } from '../../types';
import { speak, cancelSpeech } from '../../services/voiceService';
import { useSettings } from '../../context/SettingsContext';

interface PomodoroWidgetProps {
  workout: CadenceItem;
  onClose: () => void;
  onComplete: (workoutId: string) => void;
}

const motivationalPhrases = {
    75: ["Great start, keep that energy up!", "You're 25% through, excellent work.", "First quarter done. You've got this."],
    50: ["Halfway there, stay strong!", "You're at the peak. Great focus.", "50% complete. Keep pushing."],
    25: ["You're in the final stretch now!", "Just 25% to go. Finish strong.", "Almost there, give it your all!"]
};

const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ workout, onClose, onComplete }) => {
    const { isTTSOn, coPilotVoice } = useSettings();
    const initialDuration = useMemo(() => {
        if (!workout.duration) return 0;
        const minutes = parseInt(workout.duration, 10);
        return isNaN(minutes) ? 0 : minutes * 60;
    }, [workout.duration]);

    const [timeRemaining, setTimeRemaining] = useState(initialDuration);
    const [isActive, setIsActive] = useState(false);
    const spokenMilestones = React.useRef<Set<number>>(new Set());

    useEffect(() => {
        let intervalId: number | undefined;

        if (isActive && timeRemaining > 0) {
            intervalId = window.setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining <= 0 && isActive) {
            setIsActive(false);
            if (isTTSOn) speak(`${workout.name} complete. Well done.`, coPilotVoice);
            onComplete(workout.id);
        }

        return () => clearInterval(intervalId);
    }, [isActive, timeRemaining, isTTSOn, coPilotVoice, workout.name, workout.id, onComplete]);
    
    useEffect(() => {
        if (!isActive || !isTTSOn || initialDuration === 0) return;
        
        const percentageRemaining = (timeRemaining / initialDuration) * 100;
        
        const milestones: Array<keyof typeof motivationalPhrases> = [75, 50, 25];

        milestones.forEach(milestone => {
            if (percentageRemaining <= milestone && !spokenMilestones.current.has(milestone)) {
                const phrases = motivationalPhrases[milestone];
                const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                speak(phrase, coPilotVoice);
                spokenMilestones.current.add(milestone);
            }
        });

    }, [timeRemaining, initialDuration, isActive, isTTSOn, coPilotVoice]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const resetTimer = useCallback(() => {
        cancelSpeech();
        setIsActive(false);
        setTimeRemaining(initialDuration);
        spokenMilestones.current.clear();
    }, [initialDuration]);

    const progress = initialDuration > 0 ? ((initialDuration - timeRemaining) / initialDuration) * 100 : 0;
    const strokeDashoffset = 283 * (1 - progress / 100);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn" onClick={onClose}>
            <div className="bg-widget-background border-2 border-primary-accent rounded-2xl shadow-glow p-8 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-primary-text mb-2">{workout.name}</h2>
                <p className="text-secondary-text mb-6">M.A.S.S. Protocol Timer</p>

                <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="stroke-current text-widget-border/50" cx="50" cy="50" r="45" strokeWidth="6" fill="none" />
                        <circle
                            className="stroke-current text-primary-accent transition-all duration-1000"
                            cx="50" cy="50" r="45" strokeWidth="6" fill="none"
                            strokeDasharray="283"
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 50 50)"
                            style={{ strokeLinecap: 'round' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-mono tracking-tighter text-primary-text">{formatTime(timeRemaining)}</span>
                    </div>
                </div>

                <div className="flex justify-center space-x-4">
                    <button onClick={() => setIsActive(!isActive)} className="px-6 py-3 bg-primary-accent text-white rounded-lg text-lg font-semibold w-32">
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={resetTimer} className="px-6 py-3 bg-widget-background border border-widget-border rounded-lg text-lg font-semibold">
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PomodoroWidget;