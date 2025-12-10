'use client';

import React from 'react';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  className?: string;
}

// Extract video ID and type from URL
function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; id?: string } {
  // YouTube patterns
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return { type: 'youtube', id: youtubeMatch[1] };
  }

  // Vimeo patterns
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vimeoMatch) {
    return { type: 'vimeo', id: vimeoMatch[1] };
  }

  // Direct video URL
  return { type: 'direct' };
}

export function VideoPlayer({ url, autoPlay = false, className = '' }: VideoPlayerProps) {
  const { type, id } = parseVideoUrl(url);

  if (type === 'youtube' && id) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${id}?${autoPlay ? 'autoplay=1&' : ''}rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full h-full ${className}`}
        title="Video"
      />
    );
  }

  if (type === 'vimeo' && id) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${id}?${autoPlay ? 'autoplay=1&' : ''}title=0&byline=0&portrait=0`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className={`w-full h-full ${className}`}
        title="Video"
      />
    );
  }

  // Direct video URL
  return (
    <video
      src={url}
      autoPlay={autoPlay}
      controls
      playsInline
      className={`w-full h-full object-cover ${className}`}
    >
      Your browser does not support the video tag.
    </video>
  );
}
