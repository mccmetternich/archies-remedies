'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type FAQDrawerTheme = 'blue' | 'dark' | 'cream';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQDrawerConfig {
  theme: FAQDrawerTheme;
  items: FAQItem[];
}

interface FAQDrawerProps extends FAQDrawerConfig {
  className?: string;
}

// ============================================
// THEME CONFIGURATIONS
// ============================================

const themeStyles: Record<
  FAQDrawerTheme,
  {
    bg: string;
    titleColor: string;
    questionColor: string;
    answerColor: string;
    borderColor: string;
    iconColor: string;
    iconHoverBg: string;
  }
> = {
  blue: {
    bg: 'bg-[var(--primary)]',
    titleColor: 'var(--foreground)',
    questionColor: 'var(--foreground)',
    answerColor: '#333333',
    borderColor: 'rgba(26, 26, 26, 0.15)',
    iconColor: 'var(--foreground)',
    iconHoverBg: 'rgba(26, 26, 26, 0.05)',
  },
  dark: {
    bg: 'bg-[var(--foreground)]',
    titleColor: '#ffffff',
    questionColor: '#ffffff',
    answerColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    iconColor: '#ffffff',
    iconHoverBg: 'rgba(255, 255, 255, 0.05)',
  },
  cream: {
    bg: 'bg-[#f5f1eb]',
    titleColor: 'var(--foreground)',
    questionColor: 'var(--foreground)',
    answerColor: '#333333',
    borderColor: 'rgba(26, 26, 26, 0.12)',
    iconColor: 'var(--foreground)',
    iconHoverBg: 'rgba(26, 26, 26, 0.05)',
  },
};

// ============================================
// FAQ ITEM COMPONENT
// ============================================

function FAQItemRow({
  item,
  isOpen,
  onToggle,
  styles,
  isFirst,
  isLast,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  styles: (typeof themeStyles)[FAQDrawerTheme];
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="w-full">
      {/* Top border - always show for first item, border-t for others */}
      <div
        className="w-full border-t"
        style={{ borderColor: styles.borderColor }}
      />

      {/* Question Row - Clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-6 py-8 md:py-10 lg:py-12 text-left transition-colors group"
        aria-expanded={isOpen}
      >
        {/* Question Text - Extra Large (2x size) */}
        <span
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium leading-[1.1] flex-1"
          style={{
            color: styles.questionColor,
            
          }}
        >
          {item.question}
        </span>

        {/* Icon - Plus/X - Large and impactful */}
        <div className="flex-shrink-0 flex items-center justify-center">
          {isOpen ? (
            <X
              className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
              style={{ color: styles.iconColor }}
              strokeWidth={1.5}
            />
          ) : (
            <Plus
              className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
              style={{ color: styles.iconColor }}
              strokeWidth={1.5}
            />
          )}
        </div>
      </button>

      {/* Answer - Animated Expand */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.2, ease: 'easeInOut' },
            }}
            className="overflow-hidden"
          >
            <div
              className="pb-8 md:pb-10 lg:pb-12 pr-16 md:pr-20"
              style={{
                color: styles.answerColor,
                
              }}
            >
              <p className="text-base md:text-lg leading-relaxed max-w-4xl">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom border for last item */}
      {isLast && (
        <div
          className="w-full border-t"
          style={{ borderColor: styles.borderColor }}
        />
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FAQDrawer({
  theme = 'blue',
  items = [],
  className,
}: FAQDrawerProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const styles = themeStyles[theme];

  // Filter out empty items
  const validItems = items.filter((item) => item.question && item.question.trim());

  if (validItems.length === 0) {
    return null;
  }

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={cn('w-full py-12 md:py-16 lg:py-20', styles.bg, className)}>
      {/* Wider container - less padding than default */}
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24">
        {/* F.A.Q. Title - Small lettering */}
        <h2
          className="text-left uppercase mb-8 md:mb-12 lg:mb-14"
          style={{
            
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: styles.titleColor,
          }}
        >
          F.A.Q.
        </h2>

        {/* FAQ Items */}
        <div className="w-full">
          {validItems.map((item, index) => (
            <FAQItemRow
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
              styles={styles}
              isFirst={index === 0}
              isLast={index === validItems.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
