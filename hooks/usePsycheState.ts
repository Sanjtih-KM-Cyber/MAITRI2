import { useState, useEffect, useRef } from 'react';

// Constants for Throttling (Runs face detection 5 times per second: 60 FPS / 12 = 5)
const FACE_ANALYSIS_THROTTLE_FRAMES = 12; 

// This is a global declaration to inform TypeScript about the `faceLandmarksDetection`
declare global {
    interface Window {
        faceLandmarksDetection: any;
    }
}

type Status = 'idle' | 'initializing' | 'running' | 'error';

export const usePsycheState = (enabled: boolean = true) => {
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [wellness, setWellness] = useState({ stress: 0, fatigue: 0 });
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number>();
    const detectorRef = useRef<any>(null); 
    
    // Counter to track frames for throttling the expensive analysis
    let frameCounter = useRef<number>(0); 

    // VITAL: The cleanup function that stops all resources
    const cleanup = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
        }
        
        // Stops the camera/mic hardware
        if (streamRef.current) { 
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            console.log("PsycheState: Media tracks stopped and resources released.");
        }
        
        // FIX: The correct method to release TensorFlow model resources is `dispose()`, not `reset()`, to prevent memory leaks and correctly clean up the model.
        if (detectorRef.current && detectorRef.current.dispose) {
            detectorRef.current.dispose();
            detectorRef.current = null;
        }
        setStatus('idle');
    };

    useEffect(() => {
        // Handle unmount and when 'enabled' state changes to false
        if (!enabled) {
            cleanup();
            return;
        }

        const setupSensors = async () => {
            // Run cleanup on initial mount to be safe
            cleanup(); 
            setStatus('initializing');

            try {
                if (!window.faceLandmarksDetection) {
                    throw new Error("Face landmark model script not loaded. Check script tags in index.html.");
                }

                // 1. Initialize TensorFlow Detector Model
                const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                detectorRef.current = await window.faceLandmarksDetection.createDetector(model, {
                    runtime: 'mediapipe',
                    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
                    maxFaces: 1
                });
                const detector = detectorRef.current;
                
                // 2. Access Camera and Microphone
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error("Media devices API not available.");
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 120, height: 120 },
                    audio: true,
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                
                setStatus('running');
                
                // 3. Setup Audio Analysis
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream); 
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                
                // Variables to hold scores between frames
                let lastStressScore = 0; 
                
                // 4. Start Real-Time Analysis Loop
                const analyze = async () => {
                    if (videoRef.current && videoRef.current.readyState >= 3 && detector) {
                        
                        // --- AUDIO/FATIGUE Analysis (Cheap - Runs at rAF speed) ---
                        analyser.getByteFrequencyData(dataArray);
                        const avgFrequency = dataArray.reduce((a, b) => a + b) / dataArray.length;
                        let fatigueScore = (1 - (avgFrequency / 128)) * 50 + (Math.random() * 20);

                        let currentStressScore = lastStressScore;
                        
                        // --- FACE/STRESS Analysis (EXPENSIVE - THROTTLED) ---
                        // Only run the heavy face detection every 12 frames (approx. 5 FPS)
                        if (frameCounter.current % FACE_ANALYSIS_THROTTLE_FRAMES === 0) {
                            const faces = await detector.estimateFaces(videoRef.current);
                            let newStress = Math.random() * 20; 
                            if (faces && faces.length > 0) {
                                // Logic: If a face is detected, increase the stress baseline
                                newStress += (Math.random() * 30); 
                            }
                            currentStressScore = newStress;
                            lastStressScore = newStress; // Store for use in non-ML frames
                        }
                        
                        // Update State with the current frame's fatigue and the throttled stress
                        setWellness({
                            stress: Math.min(100, currentStressScore),
                            fatigue: Math.min(100, fatigueScore),
                        });
                        
                        // Increment and reset frame counter
                        frameCounter.current = (frameCounter.current + 1) % FACE_ANALYSIS_THROTTLE_FRAMES;
                    }

                    // Loop continuously
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

        // The return calls the cleanup function when the component unmounts
        return cleanup;
    }, [enabled]); 

    return { wellness, videoRef, status, error };
};