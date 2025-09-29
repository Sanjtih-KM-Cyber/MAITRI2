// src/hooks/useLocalMediaStore.ts
import { useState, useCallback, useEffect } from 'react';

// Define the structure for stored logs (video metadata and symptom entries)
export interface LogEntry {
    id: string;
    type: 'symptom' | 'diary' | 'video_meta';
    timestamp: number;
    data: any; // Can be symptom details, diary text, or video file metadata
}

const STORAGE_KEY = 'maitri_local_logs';

export const useLocalMediaStore = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Load logs from storage on startup
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
    
    // Persist logs whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.error("Failed to save logs to localStorage:", e);
        }
    }, [logs]);


    // --- LOGGING AND STORAGE FUNCTIONS ---

    const saveLogEntry = useCallback((type: 'symptom' | 'diary' | 'video_meta', data: any) => {
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


    // --- VIDEO RECORDING STUBS (3.3.1) ---

    const startVideoRecording = useCallback(() => {
        // PROVISION: Here is where the MediaRecorder API logic would go.
        console.log("MAITRI Video Log: Initiating MediaRecorder for family message...");
        // This would return a controller object to stop the recording
        return () => {
            console.log("MAITRI Video Log: Recording stopped. Saving metadata...");
            const videoMeta = {
                fileId: `vid-${Date.now()}`,
                duration: "0:35",
                preview: "Family Message Draft",
            };
            saveLogEntry('video_meta', videoMeta);
        };
    }, [saveLogEntry]);

    return { logs, saveLogEntry, listLogEntries, startVideoRecording };
};
