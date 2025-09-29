// src/hooks/useLocalMediaStore.ts
import { useState, useCallback, useEffect } from 'react';

export interface LogEntry {
    id: string;
    type: 'symptom' | 'diary' | 'video_meta';
    timestamp: number;
    data: any;
}

const STORAGE_KEY = 'maitri_local_logs';

export const useLocalMediaStore = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        try {
            const storedLogs = localStorage.getItem(STORAGE_KEY);
            if (storedLogs) {
                setLogs(JSON.parse(storedLogs));
            }
        } catch (e) {
            console.error("Failed to load logs from localStorage:", e);
        }
    }, []);
    
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.error("Failed to save logs to localStorage:", e);
        }
    }, [logs]);

    const saveLogEntry = useCallback((type: LogEntry['type'], data: any) => {
        const newEntry: LogEntry = {
            id: Date.now().toString(),
            type,
            timestamp: Date.now(),
            data,
        };
        setLogs(prev => [...prev, newEntry]);
        console.log("Log entry saved:", newEntry);
        return newEntry;
    }, []);

    const listLogEntries = useCallback((type?: LogEntry['type']) => {
        return type ? logs.filter(log => log.type === type) : logs;
    }, [logs]);

    const startVideoRecording = useCallback((onStop: () => void) => {
        console.log("MAITRI Video Log: Initiating MediaRecorder...");
        
        // Simulate a recording session
        const recordingTimeout = setTimeout(() => {
            console.log("MAITRI Video Log: Recording stopped automatically after timeout.");
            const videoMeta = {
                fileId: `vid-${Date.now()}`,
                duration: "0:35",
                preview: "Family Message Draft",
            };
            saveLogEntry('video_meta', videoMeta);
            onStop(); // Notify caller that recording has stopped
        }, 5000); // Stop after 5 seconds for simulation

        // Return a function to stop the recording manually
        return () => {
            clearTimeout(recordingTimeout);
            console.log("MAITRI Video Log: Recording stopped manually.");
             const videoMeta = {
                fileId: `vid-${Date.now()}`,
                duration: "0:21",
                preview: "Manual Stop Draft",
            };
            saveLogEntry('video_meta', videoMeta);
            onStop();
        };
    }, [saveLogEntry]);

    return { logs, saveLogEntry, listLogEntries, startVideoRecording };
};
