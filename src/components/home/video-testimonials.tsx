'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
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
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Use placeholders if no videos
  const displayVideos = videos.length > 0
    ? videos
    : Array.from({ length: 4 }).map((_, i) => ({
        id: `placeholder-${i}`,
        title: 'Customer Story',
        thumbnailUrl: '',
        videoUrl: '',
        name: `Happy Customer ${i + 1}`,
      }));

  return (
    <>
      <section ref={ref} className="section bg-[var(--foreground)] text-white overflow-hidden">
        <div className="container">
          {/* Header - Editorial style */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
            <div className="max-w-xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-6"
              >
                <span className="w-12 h-px bg-white/30" />
                Real Stories
              </motion.span>
              {title && (
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-white"
                >
                  {title}
                </motion.h2>
              )}
            </div>

            <div className="flex items-center gap-6">
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-white/60 max-w-sm leading-relaxed hidden md:block"
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex gap-2"
              >
                <button
                  onClick={() => scroll('left')}
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </div>

          {/* Video Grid */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayVideos.map((video, index) => (
              <motion.button
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                onClick={() => video.videoUrl && setActiveVideo(video)}
                className="relative shrink-0 w-[260px] md:w-[280px] aspect-[9/16] rounded-2xl overflow-hidden group"
              >
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title || 'Video testimonial'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex flex-col items-center justify-center">
                    <Play className="w-12 h-12 text-white/40 mb-4" />
                    <span className="text-white/60 text-sm">Coming Soon</span>
                  </div>
                )}

                {/* Play button overlay */}
                {video.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-500">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                      <Play className="w-5 h-5 text-[var(--foreground)] ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                )}

                {/* Name badge */}
                {video.name && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {video.name}
                      </p>
                      {video.title && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {video.title}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
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
