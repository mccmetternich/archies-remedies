'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  avatarUrl?: string | null;
  title?: string | null;
}

export function AudioPlayer({ audioUrl, avatarUrl, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate pseudo-random waveform bars (consistent per component instance)
  const waveformBars = useRef(
    Array.from({ length: 40 }, (_, i) => {
      // Create a natural-looking waveform pattern
      const position = i / 40;
      const base = 0.3;
      const wave1 = Math.sin(position * Math.PI * 2) * 0.25;
      const wave2 = Math.sin(position * Math.PI * 4 + 1) * 0.15;
      const wave3 = Math.sin(position * Math.PI * 8 + 2) * 0.1;
      const randomness = (Math.sin(i * 127.1) * 0.5 + 0.5) * 0.2;
      return Math.min(1, Math.max(0.15, base + wave1 + wave2 + wave3 + randomness));
    })
  ).current;

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Player Container - Elegant pill shape */}
      <div className="relative bg-gradient-to-r from-[#f8fbfc] to-[#f0f7fa] border border-[#bbdae9]/60 rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#bbdae9]/30 ring-2 ring-white shadow-md">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={title || 'Audio'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#bbdae9] to-[#8ec4db]">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Animated ring when playing */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border-2 border-[#bbdae9]"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            {title && (
              <p className="text-xs font-medium text-[#1a1a1a]/70 mb-1.5 truncate">
                {title}
              </p>
            )}

            {/* Waveform Progress Bar */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-8 flex items-center gap-[2px] cursor-pointer group"
            >
              {waveformBars.map((height, i) => {
                const barProgress = (i / waveformBars.length) * 100;
                const isActive = barProgress <= progress;
                const isCurrentBar = Math.abs(barProgress - progress) < 2.5;

                return (
                  <motion.div
                    key={i}
                    className={cn(
                      'flex-1 rounded-full transition-colors duration-150',
                      isActive ? 'bg-[#bbdae9]' : 'bg-[#1a1a1a]/10 group-hover:bg-[#1a1a1a]/15'
                    )}
                    style={{ height: `${height * 100}%` }}
                    animate={
                      isPlaying && isCurrentBar
                        ? { scaleY: [1, 1.2, 1], transition: { duration: 0.3 } }
                        : {}
                    }
                  />
                );
              })}
            </div>

            {/* Time Display */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] font-medium text-[#1a1a1a]/50 tabular-nums">
                {formatTime(currentTime)}
              </span>
              <span className="text-[10px] font-medium text-[#1a1a1a]/50 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!isLoaded}
            className={cn(
              'flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300',
              'bg-[#1a1a1a] text-white hover:bg-[#bbdae9] hover:text-[#1a1a1a]',
              'shadow-lg hover:shadow-xl active:scale-95',
              !isLoaded && 'opacity-50 cursor-not-allowed'
            )}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Pause className="w-5 h-5" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}
