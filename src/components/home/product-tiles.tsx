'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  price: number | null;
  compareAtPrice: number | null;
}

interface ProductTilesProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function ProductTiles({ products, title, subtitle }: ProductTilesProps) {
  return (
    <section className="section bg-white">
      <div className="container">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-light mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/products/${product.slug}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-[var(--secondary)] aspect-[4/3]">
                  {product.heroImageUrl ? (
                    <Image
                      src={product.heroImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl">
                        {product.slug === 'eye-drops' ? '💧' : '🧴'}
                      </div>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                <div className="mt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-medium mb-2 group-hover:text-[var(--primary-dark)] transition-colors">
                        {product.name}
                      </h3>
                      {product.shortDescription && (
                        <p className="text-[var(--muted-foreground)] text-sm line-clamp-2">
                          {product.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm shrink-0">
                      {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                        <span className="text-[var(--muted-foreground)] line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                      {product.price && (
                        <span className="font-medium">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        1,200+ reviews
                      </span>
                    </div>
                    <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Shop Now
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
