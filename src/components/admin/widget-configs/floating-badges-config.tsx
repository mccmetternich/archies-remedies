'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';
import type { FloatingBadge } from '@/components/widgets/floating-badges';

// ============================================
// TYPES
// ============================================

interface FloatingBadgesConfigProps {
  badges: FloatingBadge[];
  onBadgesChange: (badges: FloatingBadge[]) => void;
}

// ============================================
// SPEED & LAYER OPTIONS
// ============================================

const speedOptions: { value: FloatingBadge['speed']; label: string; description: string }[] = [
  { value: 'slow', label: 'Slow', description: '20s rotation' },
  { value: 'medium', label: 'Medium', description: '12s rotation' },
  { value: 'fast', label: 'Fast', description: '6s rotation' },
];

const layerOptions: { value: FloatingBadge['layer']; label: string; description: string }[] = [
  { value: 'below', label: 'Below', description: 'Behind page content' },
  { value: 'above', label: 'Above', description: 'On top of content' },
];

// ============================================
// HELPER: Generate unique ID
// ============================================

function generateId(): string {
  return `badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FloatingBadgesConfig({
  badges,
  onBadgesChange,
}: FloatingBadgesConfigProps) {
  const addBadge = () => {
    const newBadge: FloatingBadge = {
      id: generateId(),
      imageUrl: '',
      desktopX: 10,
      desktopY: 20,
      mobileX: 5,
      mobileY: 15,
      desktopSize: 120,
      mobileSize: 80,
      speed: 'medium',
      layer: 'below',
    };
    onBadgesChange([...badges, newBadge]);
  };

  const updateBadge = (index: number, updates: Partial<FloatingBadge>) => {
    const newBadges = [...badges];
    newBadges[index] = { ...newBadges[index], ...updates };
    onBadgesChange(newBadges);
  };

  const removeBadge = (index: number) => {
    const newBadges = badges.filter((_, i) => i !== index);
    onBadgesChange(newBadges);
  };

  const moveBadge = (index: number, direction: 'up' | 'down') => {
    const newBadges = [...badges];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= badges.length) return;
    [newBadges[index], newBadges[targetIndex]] = [newBadges[targetIndex], newBadges[index]];
    onBadgesChange(newBadges);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[var(--admin-text-primary)]">
            Floating Badges
          </h3>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            Add rotating badge overlays to the page
          </p>
        </div>
        <button
          type="button"
          onClick={addBadge}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Badge
        </button>
      </div>

      {/* Badge List */}
      {badges.length === 0 ? (
        <div className="p-8 text-center bg-[var(--admin-input)] border border-dashed border-[var(--admin-border)] rounded-xl">
          <p className="text-sm text-[var(--admin-text-muted)]">
            No badges added yet. Click &ldquo;Add Badge&rdquo; to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className="p-4 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl"
            >
              {/* Badge Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--admin-border)]">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveBadge(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-[var(--admin-text-primary)] flex-1">
                  Badge {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeBadge(index)}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <MediaPickerButton
                  label="Badge Image"
                  value={badge.imageUrl || null}
                  onChange={(url) => updateBadge(index, { imageUrl: url || '' })}
                  helpText="PNG with transparent background recommended"
                  folder="widgets"
                />
              </div>

              {/* Preview */}
              {badge.imageUrl && (
                <div className="mb-4 p-3 bg-[var(--admin-card)] rounded-lg flex items-center justify-center">
                  <div
                    className="animate-spin"
                    style={{
                      width: 60,
                      height: 60,
                      animationDuration: badge.speed === 'slow' ? '20s' : badge.speed === 'fast' ? '6s' : '12s',
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={badge.imageUrl}
                      alt="Badge preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Desktop Position & Size */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-2">
                  Desktop Position & Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      X Position (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={badge.desktopX}
                      onChange={(e) => updateBadge(index, { desktopX: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      Y Position (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={badge.desktopY}
                      onChange={(e) => updateBadge(index, { desktopY: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      Size (px)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="500"
                      value={badge.desktopSize}
                      onChange={(e) => updateBadge(index, { desktopSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Position & Size */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-2">
                  Mobile/Tablet Position & Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      X Position (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={badge.mobileX}
                      onChange={(e) => updateBadge(index, { mobileX: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      Y Position (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={badge.mobileY}
                      onChange={(e) => updateBadge(index, { mobileY: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      Size (px)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="300"
                      value={badge.mobileSize}
                      onChange={(e) => updateBadge(index, { mobileSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Speed & Layer */}
              <div className="grid grid-cols-2 gap-4">
                {/* Speed */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-2">
                    Rotation Speed
                  </label>
                  <div className="flex gap-1">
                    {speedOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateBadge(index, { speed: option.value })}
                        className={cn(
                          'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                          badge.speed === option.value
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--admin-card)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)]'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-2">
                    Layer
                  </label>
                  <div className="flex gap-1">
                    {layerOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateBadge(index, { layer: option.value })}
                        className={cn(
                          'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                          badge.layer === option.value
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--admin-card)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)]'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          <strong>Tip:</strong> Position values are percentages from the top-left corner.
          X=0 is left edge, X=100 is right edge. Y=0 is top, Y=100 is bottom.
          Mobile settings also apply to tablets.
        </p>
      </div>
    </div>
  );
}
