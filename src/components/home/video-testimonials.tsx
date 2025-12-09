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
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              {title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-3xl md:text-4xl font-light mb-2"
                >
                  {title}
                </motion.h2>
              )}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-white/60"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            {/* Navigation */}
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayVideos.map((video, index) => (
              <motion.button
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => video.videoUrl && setActiveVideo(video)}
                className="relative shrink-0 w-[280px] md:w-[300px] aspect-[9/16] rounded-2xl overflow-hidden group"
              >
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title || 'Video testimonial'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex flex-col items-center justify-center">
                    <Play className="w-16 h-16 text-white/50 mb-4" />
                    <span className="text-white/70 text-sm">Video Coming Soon</span>
                  </div>
                )}

                {/* Play button overlay */}
                {video.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-[var(--foreground)] ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}

                {/* Name badge */}
                {video.name && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
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
