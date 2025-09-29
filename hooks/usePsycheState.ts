import { useState, useEffect, useRef } from 'react';

// This is a global declaration to inform TypeScript about the `faceLandmarksDetection`
// object that will be available on the `window` object from the script loaded in index.html.
declare global {
  interface Window {
    faceLandmarksDetection: any;
  }
}

type Status = 'idle' | 'initializing' | 'running' | 'error';

export const usePsycheState = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [wellness, setWellness] = useState({ stress: 0, fatigue: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const setupSensors = async () => {
      setStatus('initializing');
      try {
        if (!window.faceLandmarksDetection) {
          throw new Error("Face landmark model script not loaded. Check script tags in index.html.");
        }

        // --- Load the model using the new API ---
        const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detector = await window.faceLandmarksDetection.createDetector(model, {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
            maxFaces: 1
        });
        
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
        
        // --- Web Audio API setup for fatigue analysis (placeholder) ---
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const analyze = async () => {
          if (videoRef.current && videoRef.current.readyState >= 3) {
            const faces = await detector.estimateFaces(videoRef.current);
            
            // Placeholder for real stress calculation based on facial landmarks
            // e.g., measure distance between eyebrows (brow furrow), jaw clenching, etc.
            let stressScore = Math.random() * 20; // Base random score
            if (faces && faces.length > 0) {
              // This is a mock calculation. A real one would be much more complex.
              stressScore += (Math.random() * 30);
            }

            // Placeholder for real fatigue calculation based on voice pitch/frequency
            analyser.getByteFrequencyData(dataArray);
            const avgFrequency = dataArray.reduce((a, b) => a + b) / dataArray.length;
            let fatigueScore = (1 - (avgFrequency / 128)) * 50 + (Math.random() * 20);

            setWellness({
              stress: Math.min(100, stressScore),
              fatigue: Math.min(100, fatigueScore),
            });
          }
          animationFrameId.current = requestAnimationFrame(analyze);
        };
        analyze();

      } catch (err) {
        console.error("Error initializing Psyche-State sensors:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setStatus('error');
      }
    };

    setupSensors();

    return () => {
      // Cleanup
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { wellness, videoRef, status, error };
};