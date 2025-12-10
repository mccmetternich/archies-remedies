'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';

interface VideoTestimonial {
  id: string;
  thumbnailUrl: string;
  videoUrl: string;
  title?: string;
  name?: string;
}

interface VideoTestimonialsGridProps {
  videos: VideoTestimonial[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function VideoTestimonialsGrid({
  videos,
  title = 'Real Results',
  subtitle = 'Hear from our community',
  className = '',
}: VideoTestimonialsGridProps) {
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  const openModal = (video: VideoTestimonial) => {
    setActiveVideo(video);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveVideo(null);
    document.body.style.overflow = '';
  };

  return (
    <section className={`py-16 md:py-24 bg-white ${className}`}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-4">
            <span className="w-8 h-px bg-[var(--foreground)]" />
            Testimonials
            <span className="w-8 h-px bg-[var(--foreground)]" />
          </span>
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-[var(--muted-foreground)]">{subtitle}</p>
        </div>

        {/* Video Grid - 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {videos.slice(0, 4).map((video) => (
            <button
              key={video.id}
              onClick={() => openModal(video)}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-[var(--sand)] cursor-pointer"
            >
              <Image
                src={video.thumbnailUrl}
                alt={video.title || 'Video testimonial'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 text-[var(--foreground)] ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Name Badge */}
              {video.name && (
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                    {video.name}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative w-full max-w-lg aspect-[9/16] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={activeVideo.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </section>
  );
}
