import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePsycheState } from '../../hooks/usePsycheState';

interface VoiceVideoFeedbackProps {
  isActive: boolean;
}

const VoiceVideoFeedback: React.FC<VoiceVideoFeedbackProps> = ({ isActive }) => {
  const { t } = useTranslation();
  const { videoRef, status } = usePsycheState(isActive);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || status !== 'running' || !videoRef.current?.srcObject) {
      return;
    }

    const stream = videoRef.current.srcObject as MediaStream;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    let animationFrameId: number;
    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      canvasCtx.fillStyle = 'rgba(10, 10, 26, 0.1)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const radius = Math.min(canvas.width, canvas.height) / 8 + (avg / 256) * 15;

      canvasCtx.beginPath();
      canvasCtx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-accent-color').trim() || '#4A90E2';
      canvasCtx.fillStyle = accentColor;
      canvasCtx.fill();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioContext.close().catch(console.error);
    };
  }, [isActive, status, videoRef]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-4 md:right-4 z-50 bg-widget-background/80 border border-widget-border rounded-lg shadow-glow overflow-hidden w-40 h-30 flex flex-col items-center justify-center p-1 backdrop-blur-md">
      {status === 'initializing' && <p className="text-xs text-secondary-text">{t('common.loading')}</p>}
      {status === 'error' && <p className="text-xs text-red-400">Feed Error</p>}
      {status === 'running' && (
        <div className="relative w-full h-full">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-md transform scaleX-[-1]" />
          <canvas ref={canvasRef} width="60" height="60" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};

export default VoiceVideoFeedback;