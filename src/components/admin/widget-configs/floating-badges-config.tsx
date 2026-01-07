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
// LAYER OPTIONS
// ============================================

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
// SLIDER COMPONENT
// ============================================

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
  step?: number;
}

function Slider({ label, value, onChange, min, max, unit = '', step = 1 }: SliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-[var(--admin-text-muted)]">{label}</label>
        <span className="text-xs font-medium text-[var(--admin-text-primary)] bg-[var(--admin-card)] px-2 py-0.5 rounded">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-[var(--admin-border)] rounded-lg appearance-none cursor-pointer slider-primary"
      />
    </div>
  );
}

// ============================================
// SPEED SLIDER COMPONENT
// ============================================

interface SpeedSliderProps {
  value: FloatingBadge['speed'];
  onChange: (value: FloatingBadge['speed']) => void;
}

function SpeedSlider({ value, onChange }: SpeedSliderProps) {
  // Map speed value to numeric (slow=0, medium=1, fast=2)
  const speedToNum = (s: FloatingBadge['speed']): number => {
    if (s === 'slow') return 0;
    if (s === 'medium') return 1;
    return 2;
  };

  const numToSpeed = (n: number): FloatingBadge['speed'] => {
    if (n <= 0.5) return 'slow';
    if (n <= 1.5) return 'medium';
    return 'fast';
  };

  const speedLabels: Record<FloatingBadge['speed'], string> = {
    slow: '20s',
    medium: '12s',
    fast: '6s',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[var(--admin-text-secondary)]">Rotation Speed</label>
        <span className="text-xs font-medium text-black bg-[var(--primary)] px-2 py-0.5 rounded">
          {value.charAt(0).toUpperCase() + value.slice(1)} ({speedLabels[value]})
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={speedToNum(value)}
        onChange={(e) => onChange(numToSpeed(Number(e.target.value)))}
        className="w-full h-2 bg-[var(--admin-border)] rounded-lg appearance-none cursor-pointer slider-primary"
      />
      <div className="flex justify-between text-[10px] text-[var(--admin-text-muted)]">
        <span>Slow</span>
        <span>Medium</span>
        <span>Fast</span>
      </div>
    </div>
  );
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
      {/* Slider Styles */}
      <style jsx global>{`
        .slider-primary::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-primary::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>

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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-black font-medium rounded-lg text-sm hover:bg-[var(--primary-dark)] transition-colors"
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
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)] text-black text-sm font-semibold">
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
              <div className="mb-5 p-3 bg-[var(--admin-card)] rounded-lg">
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-3">
                  Desktop Position & Size
                </label>
                <div className="space-y-4">
                  <Slider
                    label="X Position"
                    value={badge.desktopX}
                    onChange={(v) => updateBadge(index, { desktopX: v })}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <Slider
                    label="Y Position"
                    value={badge.desktopY}
                    onChange={(v) => updateBadge(index, { desktopY: v })}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <Slider
                    label="Size"
                    value={badge.desktopSize}
                    onChange={(v) => updateBadge(index, { desktopSize: v })}
                    min={40}
                    max={400}
                    unit="px"
                    step={10}
                  />
                </div>
              </div>

              {/* Mobile/Tablet Position & Size */}
              <div className="mb-5 p-3 bg-[var(--admin-card)] rounded-lg">
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-3">
                  Mobile/Tablet Position & Size
                </label>
                <div className="space-y-4">
                  <Slider
                    label="X Position"
                    value={badge.mobileX}
                    onChange={(v) => updateBadge(index, { mobileX: v })}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <Slider
                    label="Y Position"
                    value={badge.mobileY}
                    onChange={(v) => updateBadge(index, { mobileY: v })}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <Slider
                    label="Size"
                    value={badge.mobileSize}
                    onChange={(v) => updateBadge(index, { mobileSize: v })}
                    min={30}
                    max={200}
                    unit="px"
                    step={5}
                  />
                </div>
              </div>

              {/* Speed & Layer */}
              <div className="grid grid-cols-2 gap-4">
                {/* Speed Slider */}
                <div className="p-3 bg-[var(--admin-card)] rounded-lg">
                  <SpeedSlider
                    value={badge.speed}
                    onChange={(v) => updateBadge(index, { speed: v })}
                  />
                </div>

                {/* Layer */}
                <div className="p-3 bg-[var(--admin-card)] rounded-lg">
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
                            ? 'bg-[var(--primary)] text-black'
                            : 'bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)]'
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
      <div className="p-3 bg-[var(--primary)]/15 border border-[var(--primary)]/30 rounded-lg">
        <p className="text-xs text-black">
          <strong>Tip:</strong> Position values are percentages from the top-left corner.
          X=0 is left edge, X=100 is right edge. Y=0 is top, Y=100 is bottom.
          Mobile settings also apply to tablets.
        </p>
      </div>
    </div>
  );
}
