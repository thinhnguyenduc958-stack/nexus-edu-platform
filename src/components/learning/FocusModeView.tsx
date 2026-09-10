import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Clock } from 'lucide-react';

export const FocusModeView: React.FC = () => {
  const { setCurrentView, addToast } = useApp();

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);
  const [subject, setSubject] = useState('Toán học');
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            playChime();
            setIsRunning(false);
            addToast('🎉 Chúc mừng! Bạn đã hoàn thành phiên tập trung 25 phút!', 'success');
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Gentle completion chime synthesized via Web Audio API
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Audio context not allowed or failed
    }
  };

  const toggleAmbientSound = () => {
    if (ambientSound) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAmbientSound(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Generate gentle pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.05; // Soft volume
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(ctx.destination);
        whiteNoise.start();

        audioCtxRef.current = ctx;
        noiseNodeRef.current = whiteNoise;
        setAmbientSound(true);
        addToast('Đã bật âm thanh tiếng mưa / sóng nhẹ giúp tập trung', 'info');
      } catch (err) {
        addToast('Không thể bật âm thanh nền', 'warning');
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-center">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (audioCtxRef.current) audioCtxRef.current.close();
            setCurrentView('home');
          }}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Phương pháp Pomodoro</span>
        </span>
      </div>

      {/* Main Focus Clock */}
      <div className="p-10 rounded-3xl bg-neutral-950 text-white shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Đang tập trung môn {subject}
          </span>
          <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight mt-3">
            {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 cursor-pointer ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(25 * 60);
            }}
            className="w-14 h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Đặt lại 25:00"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleAmbientSound}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
              ambientSound ? 'bg-emerald-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
            title="Bật âm thanh tập trung"
          >
            {ambientSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Select Subject */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-wrap items-center justify-center gap-2">
        {['Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học'].map(sub => (
          <button
            key={sub}
            onClick={() => setSubject(sub)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              subject === sub
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

    </div>
  );
};
