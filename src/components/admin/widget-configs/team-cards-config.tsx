'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { cn } from '@/lib/utils';
import type { TeamCard, TeamCardsTheme } from '@/components/widgets/team-cards';

// ============================================
// TYPES
// ============================================

interface TeamCardsConfigProps {
  cards: TeamCard[];
  theme: TeamCardsTheme;
  onCardsChange: (cards: TeamCard[]) => void;
  onThemeChange: (theme: TeamCardsTheme) => void;
}

// ============================================
// THEME OPTIONS
// ============================================

const themeOptions: { value: TeamCardsTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function TeamCardsConfig({
  cards,
  theme,
  onCardsChange,
  onThemeChange,
}: TeamCardsConfigProps) {
  const addCard = () => {
    const newCard: TeamCard = {
      id: crypto.randomUUID(),
      imageUrl: '',
      name: '',
      title: '',
      bio: '',
    };
    onCardsChange([...cards, newCard]);
  };

  const updateCard = (index: number, updates: Partial<TeamCard>) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], ...updates };
    onCardsChange(updated);
  };

  const removeCard = (index: number) => {
    onCardsChange(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onThemeChange(option.value)}
              className={cn(
                'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                theme === option.value
                  ? 'bg-[var(--primary)] text-[var(--foreground)] border-2 border-[var(--primary)]'
                  : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">
            Team Members
          </label>
          <button
            type="button"
            onClick={addCard}
            className="flex items-center gap-1.5 text-sm text-[var(--primary)] hover:text-[var(--foreground)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>

        <div className="space-y-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="p-4 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] mt-1 cursor-grab" />
                <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                  Card {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCard(index)}
                  className="ml-auto p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-2">
                    Portrait Image
                  </label>
                  <MediaPickerButton
                    label="Choose Portrait"
                    value={card.imageUrl}
                    onChange={(url) => updateCard(index, { imageUrl: url })}
                  />
                  <p className="mt-1 text-[10px] text-[var(--admin-text-muted)]">
                    Recommended: 4:5 aspect ratio (e.g. 800×1000px)
                  </p>
                </div>

                {/* Title (Role) */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-2">
                    Title / Role
                  </label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(index, { title: e.target.value })}
                    placeholder="The Formulation Architect"
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => updateCard(index, { name: e.target.value })}
                    placeholder="The Scientist"
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-2">
                    Bio
                  </label>
                  <textarea
                    value={card.bio}
                    onChange={(e) => updateCard(index, { bio: e.target.value })}
                    placeholder="Brief bio description..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-8 text-sm text-[var(--admin-text-muted)]">
            No team cards yet. Click &quot;Add Card&quot; to get started.
          </div>
        )}
      </div>
    </div>
  );
}
