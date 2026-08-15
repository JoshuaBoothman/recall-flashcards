import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (blob: Blob) => void;
  onClear: () => void;
  existingAudioUrl?: string | null;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, onClear, existingAudioUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || '';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioReady(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or error', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClear = () => {
    setAudioUrl(null);
    onClear();
  };

  const handlePlay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!audioUrl && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-200 active:scale-95 transition-transform flex items-center gap-2"
        >
          <Mic className="w-5 h-5" /> Record Audio
        </button>
      )}

      {isRecording && (
        <button
          type="button"
          onClick={stopRecording}
          className="p-3 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-xl active:scale-95 transition-transform flex items-center gap-2 animate-pulse"
        >
          <Square className="w-5 h-5" /> Stop Recording
        </button>
      )}

      {audioUrl && !isRecording && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePlay}
            className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl hover:bg-green-200 active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 active:scale-95 transition-transform"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-500">Audio recorded</span>
        </div>
      )}
    </div>
  );
};
