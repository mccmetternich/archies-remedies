'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, Check } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [hasPlayed, setHasPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Generate Audacity-style waveform with 120 bars - fuller, no dead spots
  const waveformBars = useRef(
    Array.from({ length: 120 }, (_, i) => {
      const position = i / 120;
      const base = 0.25; // Higher base = no dead spots
      const wave1 = Math.sin(position * Math.PI * 4) * 0.28;
      const wave2 = Math.sin(position * Math.PI * 9 + 0.7) * 0.18;
      const wave3 = Math.sin(position * Math.PI * 17 + 1.4) * 0.12;
      const wave4 = Math.sin(position * Math.PI * 31 + 2.3) * 0.08;
      const wave5 = Math.sin(position * Math.PI * 47 + 3.1) * 0.05;
      const randomness = (Math.sin(i * 127.1 + 47.3) * 0.5 + 0.5) * 0.1;
      const peakBoost = i % 5 === 0 ? 0.15 : (i % 3 === 0 ? 0.08 : 0);
      // Subtle dips instead of dead gaps - minimum 0.18 height
      const subtleDip = (i % 13 === 0 || i % 17 === 0) ? -0.05 : 0;
      return Math.min(1, Math.max(0.18, base + wave1 + wave2 + wave3 + wave4 + wave5 + randomness + peakBoost + subtleDip));
    })
  ).current;

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress - use state duration or fall back to audio element
  const effectiveDuration = duration || (audioRef.current?.duration || 0);
  const progress = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      setHasPlayed(true);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;

    // Use state duration, or fall back to audio element's duration
    const audioDuration = duration || audioRef.current.duration;
    if (!audioDuration || !isFinite(audioDuration)) return;

    // Update duration state if it wasn't set
    if (!duration && audioDuration > 0) {
      setDuration(audioDuration);
    }

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Helper to safely set duration - checks if valid before setting
    const trySetDuration = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      trySetDuration();
    };

    const handleDurationChange = () => {
      trySetDuration();
    };

    const handleCanPlay = () => {
      trySetDuration();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Also try to set duration on timeupdate as fallback
      trySetDuration();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Check if duration is already available (cached audio)
    trySetDuration();

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Should we show the pulse animation? Only before first play
  const showPulse = !hasPlayed && !isPlaying;

  return (
    <div className="w-full">
      {/* Hidden audio element - preload auto for reliable duration */}
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Player Container */}
      <div className="relative bg-[#f8f8f8] border border-[#d4d4d4] px-2.5 py-2">
        {/* Main row: Thumbnail + Content */}
        <div className="flex items-start gap-3">
          {/* Square Avatar + Centered Play Button */}
          <button
            onClick={togglePlay}
            className="relative flex-shrink-0 w-[72px] h-[72px] group"
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
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Overlay + Play Button - entire thing pulses when not played */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-200">
              {showPulse ? (
                <motion.div
                  className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center"
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                </motion.div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" fill="currentColor" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                  )}
                </div>
              )}
            </div>
          </button>

          {/* Content Area */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            {/* Verified Customer + Timestamp on same line */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#bbdae9] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2 h-2 text-[#1a1a1a]" strokeWidth={3} />
                </div>
                <span className="text-[9px] font-medium uppercase tracking-wide text-[#1a1a1a]/50">
                  Verified Customer
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#1a1a1a]/40 tabular-nums">
                {formatTime(currentTime)} / {formatTime(effectiveDuration)}
              </span>
            </div>

            {/* Title Row */}
            {title && (
              <p className="text-[12px] font-medium text-[#1a1a1a]/70 truncate leading-tight mt-0.5">
                {title}
              </p>
            )}

            {/* 3px gap before waveform */}
            <div className="h-[3px]" />

            {/* Waveform Progress Bar */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative w-full h-10 flex items-center gap-[0.5px] cursor-pointer group"
            >
              {waveformBars.map((height, i) => {
                const barProgress = (i / waveformBars.length) * 100;
                const isActive = barProgress <= progress;

                return (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 rounded-[0.5px] transition-colors duration-100',
                      isActive ? 'bg-[#bbdae9]' : 'bg-[#1a1a1a]/10 group-hover:bg-[#1a1a1a]/15'
                    )}
                    style={{ height: `${height * 100}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Quote Capsule - Full width, spans entire container */}
        {quote && (
          <div className="mt-2 w-full px-3 py-1.5 bg-[#bbdae9]/30 border border-[#bbdae9]/40 rounded-full">
            <p
              className="text-[#1a1a1a]/70 text-left leading-tight italic"
              style={{ fontSize: '12.5px' }}
            >
              {quote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
