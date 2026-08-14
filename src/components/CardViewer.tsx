import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { Card, Face } from '../store/useStore';
import { getMediaUrl } from '../store/idb';

interface CardViewerProps {
  card: Card;
  onNextCard: () => void;
  isLocked: boolean;
}

const FaceContent = ({ face }: { face?: Face }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMedia = async () => {
      setImageUrl(null);
      if (face?.imageUrl) {
        const url = await getMediaUrl(face.imageUrl);
        if (active) setImageUrl(url);
      }
    };

    loadMedia();
    return () => { active = false; };
  }, [face]);

  if (!face) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full p-4 min-h-0 gap-6">
      {imageUrl && (
        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="Card visual" 
            className="max-h-full max-w-full object-contain rounded-2xl shadow-md"
          />
        </div>
      )}
      {face.text && (
        <h2 className="shrink-0 text-4xl md:text-6xl lg:text-7xl font-bold text-center text-slate-800 dark:text-slate-100 leading-tight">
          {face.text}
        </h2>
      )}
    </div>
  );
};

export const CardViewer: React.FC<CardViewerProps> = ({ card, onNextCard, isLocked }) => {
  const [tapCount, setTapCount] = useState(0);
  const [startFaceIndex, setStartFaceIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('header-controls'));
  }, []);

  // Reset state when the card reference changes
  useEffect(() => {
    setTapCount(0);
    setStartFaceIndex(Math.floor(Math.random() * card.faces.length));
  }, [card]);

  const isSideAVisible = tapCount % 2 === 0;
  
  // Calculate which logical face index should be on Side A and Side B to prevent flashing
  // We only want a side to update its face when it is rotating INTO view, not when rotating AWAY.
  const sideAOffset = Math.floor(tapCount / 2) * 2;
  const sideBOffset = tapCount === 0 ? 1 : Math.floor((tapCount - 1) / 2) * 2 + 1;

  const sideAFaceIndex = (startFaceIndex + sideAOffset) % card.faces.length;
  const sideBFaceIndex = (startFaceIndex + sideBOffset) % card.faces.length;

  const sideAFace = card.faces[sideAFaceIndex];
  const sideBFace = card.faces[sideBFaceIndex];

  const currentFace = isSideAVisible ? sideAFace : sideBFace;

  // Load and play audio for the CURRENT face
  useEffect(() => {
    let active = true;
    const loadAudio = async () => {
      setAudioUrl(null);
      const audioSourceId = currentFace?.audioUrl || card.globalAudioUrl;
      if (audioSourceId) {
        const url = await getMediaUrl(audioSourceId);
        if (active) {
          setAudioUrl(url);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.warn('Autoplay prevented', e));
            }
          }, 300);
        }
      }
    };
    loadAudio();
    return () => { active = false; };
  }, [currentFace, card.globalAudioUrl]);

  const handleTap = () => {
    if (!isLocked && tapCount >= card.faces.length - 1) {
      onNextCard();
    } else {
      setTapCount(tapCount + 1);
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const speakerButton = audioUrl ? (
    <button 
      onClick={handlePlayAudio}
      className="p-1.5 sm:p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:scale-110 active:scale-95 transition-transform"
      aria-label="Replay audio"
    >
      <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  ) : null;

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 md:p-8 min-h-0">
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
      {portalNode && createPortal(speakerButton, portalNode)}
      
      <div 
        className="flex-1 w-full relative perspective-[1500px] cursor-pointer"
        onClick={handleTap}
      >
        <motion.div
          className="w-full h-full absolute inset-0"
          animate={{ rotateY: tapCount * 180 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Side A (0deg) */}
          <div 
            className="absolute inset-0 bg-card-light dark:bg-card-dark rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-8 border border-slate-100 dark:border-slate-800"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)' 
            }}
          >
            <FaceContent face={sideAFace} />
            <div className="absolute top-6 right-8 text-slate-400 font-bold text-xl">
              {((startFaceIndex + sideAOffset) % card.faces.length) + 1} / {card.faces.length}
            </div>
          </div>

          {/* Side B (180deg) */}
          <div 
            className="absolute inset-0 bg-card-light dark:bg-card-dark rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-8 border border-slate-100 dark:border-slate-800"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)' 
            }}
          >
            <FaceContent face={sideBFace} />
            <div className="absolute top-6 right-8 text-slate-400 font-bold text-xl">
              {((startFaceIndex + sideBOffset) % card.faces.length) + 1} / {card.faces.length}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
