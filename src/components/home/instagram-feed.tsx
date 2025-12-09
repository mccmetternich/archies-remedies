'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Instagram } from 'lucide-react';

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

export function InstagramFeed({ posts, instagramUrl }: InstagramFeedProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Use placeholders if no posts
  const displayPosts = posts.length > 0
    ? posts
    : Array.from({ length: 6 }).map((_, i) => ({
        id: `placeholder-${i}`,
        thumbnailUrl: '',
        postUrl: instagramUrl || 'https://instagram.com',
        caption: 'Follow us on Instagram',
      }));

  return (
    <section ref={ref} className="py-12 overflow-hidden">
      <div className="container mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Instagram className="w-6 h-6" />
            <h3 className="text-xl font-medium">Follow Along</h3>
          </div>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-[var(--primary-dark)] transition-colors"
            >
              @archiesremedies →
            </a>
          )}
        </div>
      </div>

      {/* Scrolling Feed */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.postUrl || instagramUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative shrink-0 w-[200px] md:w-[250px] aspect-square rounded-xl overflow-hidden group"
            >
              {post.thumbnailUrl ? (
                <Image
                  src={post.thumbnailUrl}
                  alt={post.caption || 'Instagram post'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)] flex items-center justify-center">
                  <Instagram className="w-12 h-12 text-[var(--foreground)]/30" />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Gradient edges */}
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
