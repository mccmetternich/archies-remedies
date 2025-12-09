'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight, X, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface VideoTestimonial {
  id: string;
  title: string | null;
  thumbnailUrl: string;
  videoUrl: string;
  name: string | null;
}

interface VideoTestimonialsProps {
  videos: VideoTestimonial[];
  title?: string;
  subtitle?: string;
}

// Social proof avatars
const SOCIAL_PROOF_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
];

// Video Preview component with autoplay
function VideoPreview({ video, onClick }: { video: VideoTestimonial; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Start showing video preview after a slight delay
    const timer = setTimeout(() => {
      if (video.videoUrl && !video.videoUrl.includes('vimeo')) {
        setShowVideo(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [video.videoUrl]);

  return (
    <button
      onClick={onClick}
      className="relative shrink-0 w-[280px] md:w-[320px] lg:w-[380px] aspect-[9/16] rounded-3xl overflow-hidden group shadow-xl"
    >
      {/* Video autoplay preview (muted, loop first few seconds) */}
      {showVideo && video.videoUrl && !video.videoUrl.includes('vimeo') ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          muted
          loop
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />
      ) : video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.title || 'Video testimonial'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-white/80 to-white/40" />
      )}

      {/* Play button overlay - only show on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
          <Play className="w-6 h-6 text-[var(--foreground)] ml-0.5" fill="currentColor" />
        </div>
      </div>
    </button>
  );
}

export function VideoTestimonials({ videos, title, subtitle }: VideoTestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Only show real videos, no placeholders
  const displayVideos = videos.length > 0 ? videos : [];

  if (displayVideos.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-20 md:py-28 bg-[var(--primary)] overflow-hidden">
        <div className="container">
          {/* Two column layout - Title on left, videos on right */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column - Title & Subtitle */}
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              {/* Social proof above Real Stories */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex -space-x-2">
                  {SOCIAL_PROOF_AVATARS.map((avatar, idx) => (
                    <Image
                      key={idx}
                      src={avatar}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-[var(--primary)] object-cover"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[var(--foreground)] text-[var(--foreground)]" />
                  ))}
                </div>
              </div>

              <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-6">
                <span className="w-12 h-px bg-[var(--foreground)]/30" />
                Real Stories
              </span>
              {title && (
                <h2 className="text-[var(--foreground)] mb-6">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[var(--foreground)]/70 leading-relaxed mb-8">
                  {subtitle}
                </p>
              )}

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={() => scroll('left')}
                  className="w-14 h-14 rounded-full border-2 border-[var(--foreground)]/20 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 text-[var(--foreground)]" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-14 h-14 rounded-full border-2 border-[var(--foreground)]/20 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 text-[var(--foreground)]" />
                </button>
              </div>
            </div>

            {/* Right Column - Video Thumbnails - 3 visible at once */}
            <div className="lg:col-span-8">
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mr-6 lg:-mr-20 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {displayVideos.map((video) => (
                  <div key={video.id} className="snap-start">
                    <VideoPreview
                      video={video}
                      onClick={() => video.videoUrl && setActiveVideo(video)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none" hideClose>
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {activeVideo?.videoUrl && (
            <div className="aspect-video">
              {activeVideo.videoUrl.includes('vimeo') ? (
                <iframe
                  src={`${activeVideo.videoUrl}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
