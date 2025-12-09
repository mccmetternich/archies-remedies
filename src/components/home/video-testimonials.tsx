'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

export function VideoTestimonials({ videos, title, subtitle }: VideoTestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Use placeholders if no videos
  const displayVideos = videos.length > 0
    ? videos
    : Array.from({ length: 6 }).map((_, i) => ({
        id: `placeholder-${i}`,
        title: 'Customer Story',
        thumbnailUrl: '',
        videoUrl: '',
        name: `Happy Customer ${i + 1}`,
      }));

  return (
    <>
      <section className="py-20 md:py-28 bg-[var(--primary)] overflow-hidden">
        <div className="container">
          {/* Two column layout - Title on left, videos on right */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column - Title & Subtitle */}
            <div className="lg:col-span-4 lg:sticky lg:top-32">
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

            {/* Right Column - Video Thumbnails */}
            <div className="lg:col-span-8">
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mr-6 lg:-mr-20"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {displayVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => video.videoUrl && setActiveVideo(video)}
                    className="relative shrink-0 w-[320px] md:w-[360px] aspect-[9/16] rounded-3xl overflow-hidden group shadow-xl"
                  >
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title || 'Video testimonial'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-white/80 to-white/40 flex flex-col items-center justify-center">
                        <Play className="w-16 h-16 text-[var(--foreground)]/30 mb-4" />
                        <span className="text-[var(--foreground)]/50 text-sm font-medium">Coming Soon</span>
                      </div>
                    )}

                    {/* Play button overlay */}
                    {video.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                          <Play className="w-6 h-6 text-[var(--foreground)] ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {/* Name badge */}
                    {video.name && (
                      <div className="absolute bottom-5 left-5 right-5">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4">
                          <p className="text-base font-medium text-[var(--foreground)]">
                            {video.name}
                          </p>
                          {video.title && (
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {video.title}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
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
