// src/hooks/usePsycheState.ts (MODIFIED FOR COMBINED SCORING)
import { useState, useEffect, useRef, useCallback } from 'react';

// Constants for Throttling (Runs face detection 5 times per second)
const FACE_ANALYSIS_THROTTLE_FRAMES = 12; 

// This is a global declaration to inform TypeScript about the `faceLandmarksDetection`
declare global {
    interface Window {
        faceLandmarksDetection: any;
    }
}

type Status = 'idle' | 'initializing' | 'running' | 'error';

// The returned scores will be 0-100 internally, converted to 0-10 in the Context
interface InternalWellness { stress: number; fatigue: number; }

export const usePsycheState = (enabled: boolean = true) => {
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [wellness, setWellness] = useState<InternalWellness>({ stress: 0, fatigue: 0 });
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number>();
    const detectorRef = useRef<any>(null); 
    let frameCounter = useRef<number>(0); 
    
    const cleanup = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
        }
        
        if (streamRef.current) { 
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // FIX: The dispose() method for the face landmark detector expects an argument. Calling it without arguments causes a runtime error. Passing null satisfies the function signature.
        if (detectorRef.current && detectorRef.current.dispose) {
            detectorRef.current.dispose(null);
            detectorRef.current = null;
        }
        setStatus('idle');
    }, []);

    useEffect(() => {
        if (!enabled) {
            cleanup();
            return;
        }

        const setupSensors = async () => {
            cleanup(); 
            setStatus('initializing');

            try {
                if (!window.faceLandmarksDetection) {
                    // This error indicates the scripts in index.html didn't load correctly
                    throw new Error("Face landmark model script not loaded.");
                }

                // 1. Initialize TensorFlow Detector Model (STUBBED)
                const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                detectorRef.current = await window.faceLandmarksDetection.createDetector(model, {
                    runtime: 'mediapipe',
                    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
                    maxFaces: 1
                });
                const detector = detectorRef.current;
                
                // 2. Access Camera and Microphone
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 120, height: 120 }, audio: true });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                
                setStatus('running');
                
                // 3. Setup Audio Analysis (STUBBED - Only simple context)
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream); 
                const analyser = audioContext.createAnalyser();
                source.connect(analyser); // Actual analysis logic is complex, using simple mocks

                // 4. Start Real-Time Analysis Loop
                let lastStressScore = 0; 
                
                const analyze = async () => {
                    if (videoRef.current && videoRef.current.readyState >= 3 && detector) {
                        
                        // --- VOCAL FATIGUE ANALYSIS (STUB: uses Math.random) ---
                        // In a real app, this analyzes the analyser's data.
                        const newFatigue = Math.min(100, (Math.random() * 40) + 20); // 20-60 baseline

                        let currentStressScore = lastStressScore;
                        
                        // --- VISUAL STRESS ANALYSIS (THROTTLED STUB: uses Math.random) ---
                        if (frameCounter.current % FACE_ANALYSIS_THROTTLE_FRAMES === 0) {
                            // This section would run detector.estimateFaces(videoRef.current)
                            // and calculate brow furrowing from keypoints.
                            currentStressScore = Math.min(100, (Math.random() * 50) + 10); // 10-60 baseline
                            lastStressScore = currentStressScore; 
                        }
                        
                        setWellness({
                            stress: lastStressScore,
                            fatigue: newFatigue,
                        });
                        
                        frameCounter.current = (frameCounter.current + 1) % FACE_ANALYSIS_THROTTLE_FRAMES;
                    }

                    animationFrameId.current = requestAnimationFrame(analyze);
                };
                
                analyze();

            } catch (err) {
                console.error("Error initializing Psyche-State sensors:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
                setStatus('error');
                cleanup(); 
            }
        };

        setupSensors();
        return cleanup; 
    }, [enabled, cleanup]); 

    return { wellness, videoRef, status, error, cleanup };
};