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
  quote?: string | null;
}

export function AudioPlayer({ audioUrl, avatarUrl, title, quote }: AudioPlayerProps) {
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

      {/* Player Container - Sharp edges, compact, sleek */}
      <div className="relative bg-[#f8f8f8] border border-[#e5e5e5] px-2.5 py-2">
        <div className="flex items-center gap-3">
          {/* Combined Avatar + Play Button */}
          <button
            onClick={togglePlay}
            className="relative flex-shrink-0 w-11 h-11 group"
          >
            {/* Avatar Image */}
            <div className="w-full h-full overflow-hidden bg-[#bbdae9]/30">
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
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Play/Pause Icon - Bottom Right Corner */}
            <div
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center',
                'bg-[#1a1a1a] text-white shadow-md',
                'group-hover:bg-[#bbdae9] group-hover:text-[#1a1a1a]',
                'transition-colors duration-200'
              )}
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Pause className="w-2.5 h-2.5" fill="currentColor" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Play className="w-2.5 h-2.5 ml-0.5" fill="currentColor" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Animated ring when playing */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 border border-[#bbdae9]"
                />
              )}
            </AnimatePresence>
          </button>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Title Row: Name left, Verified Customer right */}
            <div className="flex items-center justify-between mb-1">
              {/* Title - left */}
              {title && (
                <p className="text-[12px] font-medium text-[#1a1a1a]/70 truncate leading-tight">
                  {title}
                </p>
              )}
              {/* Verified Customer - right */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-2 h-2 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-[12px] font-medium text-[#1a1a1a]/70 leading-tight">
                  Verified Customer
                </span>
              </div>
            </div>

            {/* Waveform Progress Bar - more compact */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-5 flex items-center gap-[1.5px] cursor-pointer group"
            >
              {waveformBars.map((height, i) => {
                const barProgress = (i / waveformBars.length) * 100;
                const isActive = barProgress <= progress;
                const isCurrentBar = Math.abs(barProgress - progress) < 2.5;

                return (
                  <motion.div
                    key={i}
                    className={cn(
                      'flex-1 transition-colors duration-150',
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

            {/* Time Display - inline */}
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-[9px] font-medium text-[#1a1a1a]/40 tabular-nums">
                {formatTime(currentTime)}
              </span>
              <span className="text-[9px] font-medium text-[#1a1a1a]/40 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Quote Section with L-shaped connector */}
        {quote && (
          <div className="relative flex items-center mt-2">
            {/* L-shaped connector SVG */}
            <svg
              className="absolute text-[#bbdae9] pointer-events-none"
              style={{
                left: '22px', // Center of thumbnail (44px / 2)
                top: '-8px',
                width: 'calc(22px + 12px)', // Half thumbnail + gap
                height: 'calc(100% + 8px)',
              }}
              preserveAspectRatio="none"
            >
              {/* Vertical line down from thumbnail center */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="calc(100% - 12px)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              {/* Horizontal line to capsule */}
              <line
                x1="0"
                y1="calc(100% - 12px)"
                x2="100%"
                y2="calc(100% - 12px)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {/* Spacer for thumbnail + gap width */}
            <div className="flex-shrink-0 w-11 mr-3" />
            {/* Quote Capsule - aligned with content area */}
            <div className="flex-1 min-w-0">
              <div className="px-3 py-2 bg-[#bbdae9]/30 border border-[#bbdae9]/40 rounded-full">
                <p className="text-[11px] text-[#1a1a1a]/70 italic text-center leading-tight">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
