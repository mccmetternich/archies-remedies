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
    <section className="py-16 md:py-24 bg-[var(--secondary)] overflow-hidden">
      <div className="container mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-4 block">
              @archiesremedies
            </span>
            <h2 className="text-3xl md:text-4xl font-light mb-2">
              Follow Along
            </h2>
            <p className="text-[var(--muted-foreground)]">
              Join our community for eye care tips, product updates, and wellness inspiration.
            </p>
          </div>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--foreground)] text-white rounded-full font-medium text-sm hover:bg-[var(--foreground)]/90 transition-colors"
            >
              <Instagram className="w-5 h-5" />
              Follow Us
            </a>
          )}
        </div>
      </div>

      {/* Infinite Scrolling Marquee */}
      <div className="relative">
        {/* First Row - Left to Right */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {duplicatedPosts.map((post, index) => (
            <a
              key={`row1-${post.id}-${index}`}
              href={post.postUrl || instagramUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="relative shrink-0 w-[280px] md:w-[320px] aspect-square mx-2 rounded-2xl overflow-hidden group"
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
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-5 h-5 text-[var(--foreground)]" />
              </div>
            </a>
          ))}
        </div>

        {/* Gradient Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--secondary)] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--secondary)] to-transparent pointer-events-none z-10" />
      </div>

      {/* Second Row - Right to Left (Optional for even more visual interest) */}
      <div className="relative mt-4">
        <div className="flex animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...duplicatedPosts].reverse().map((post, index) => (
            <a
              key={`row2-${post.id}-${index}`}
              href={post.postUrl || instagramUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="relative shrink-0 w-[280px] md:w-[320px] aspect-square mx-2 rounded-2xl overflow-hidden group"
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
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-5 h-5 text-[var(--foreground)]" />
              </div>
            </a>
          ))}
        </div>

        {/* Gradient Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--secondary)] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--secondary)] to-transparent pointer-events-none z-10" />
      </div>

      {/* Stats Bar */}
      <div className="container mt-12">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-[var(--foreground)]">15K+</p>
            <p className="text-sm text-[var(--muted-foreground)]">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-[var(--foreground)]">500+</p>
            <p className="text-sm text-[var(--muted-foreground)]">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-[var(--foreground)]">50K+</p>
            <p className="text-sm text-[var(--muted-foreground)]">Likes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
