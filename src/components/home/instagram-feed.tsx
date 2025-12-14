'use client';

import React from 'react';
import Image from 'next/image';
import { Instagram, Heart, MessageCircle } from 'lucide-react';

interface InstagramPost {
  id: string;
  thumbnailUrl: string;
  postUrl: string | null;
  caption: string | null;
}

interface InstagramFeedProps {
  posts: InstagramPost[];
  instagramUrl?: string | null;
}

// Placeholder images from Unsplash for eye care/wellness aesthetic
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1617634815994-4c8a7c6c3e3a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
];

export function InstagramFeed({ posts, instagramUrl }: InstagramFeedProps) {
  // Create a combined array with either real posts or placeholders
  const displayPosts = posts.length > 0
    ? posts
    : PLACEHOLDER_IMAGES.map((url, i) => ({
        id: `placeholder-${i}`,
        thumbnailUrl: url,
        postUrl: instagramUrl || 'https://instagram.com',
        caption: 'Follow us for eye care tips & wellness inspiration',
      }));

  // Duplicate for infinite scroll effect
  const duplicatedPosts = [...displayPosts, ...displayPosts];

  return (
    <section className="py-16 md:py-20 bg-[var(--cream)] overflow-hidden">
      {/* Header with proper spacing - mb-[50px] for 50px gap to thumbnails */}
      <div className="container mb-[50px]">
        <div>
          <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-6">
            <span className="w-12 h-px bg-[var(--foreground)]" />
            @archiesremedies
          </span>
          <h2 className="mb-4">
            Follow Along
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-md">
            Join our community for eye care tips, product updates, and wellness inspiration.
          </p>
        </div>
      </div>

      {/* Single Row - Continuous Scrolling Marquee (full width visible) */}
      <div className="relative w-screen -ml-[50vw] left-1/2">
        <div className="flex animate-marquee-continuous hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {duplicatedPosts.map((post, index) => (
            <a
              key={`row1-${post.id}-${index}`}
              href={post.postUrl || instagramUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="relative shrink-0 w-[280px] md:w-[320px] aspect-square mx-3 overflow-hidden group"
            >
              {post.thumbnailUrl ? (
                <Image
                  src={post.thumbnailUrl}
                  alt={post.caption || 'Instagram post'}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] flex items-center justify-center">
                  <Instagram className="w-16 h-16 text-white/50" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="flex items-center gap-4 text-white mb-3">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{Math.floor(Math.random() * 500) + 100}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{Math.floor(Math.random() * 50) + 5}</span>
                  </div>
                </div>
                {post.caption && (
                  <p className="text-white/90 text-sm line-clamp-2">{post.caption}</p>
                )}
              </div>

              {/* Instagram Icon Badge */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-5 h-5 text-[var(--foreground)]" />
              </div>
            </a>
          ))}
        </div>

        {/* Gradient Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--cream)] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--cream)] to-transparent pointer-events-none z-10" />
      </div>

      {/* Stats Bar - 30px spacing from carousel */}
      <div className="container mt-[30px]">
        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          <div className="text-center">
            <p className="text-3xl font-normal tracking-tight">15K+</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-normal tracking-tight">500+</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-normal tracking-tight">50K+</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Likes</p>
          </div>
        </div>

        {/* Follow Us Button - centered below stats */}
        {instagramUrl && (
          <div className="flex justify-center mt-10">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button-primary"
            >
              <Instagram className="w-5 h-5" />
              Follow Us
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
