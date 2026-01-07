'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { cn } from '@/lib/utils';
import type { ScaleCarouselItem, ScaleCarouselAspectRatio } from '@/components/widgets/scale-carousel';

// ============================================
// TYPES
// ============================================

interface ScaleCarouselConfigProps {
  items: ScaleCarouselItem[];
  aspectRatio: ScaleCarouselAspectRatio;
  scaleIntensity: number;
  autoPlayCenter: boolean;
  onItemsChange: (items: ScaleCarouselItem[]) => void;
  onAspectRatioChange: (aspectRatio: ScaleCarouselAspectRatio) => void;
  onScaleIntensityChange: (intensity: number) => void;
  onAutoPlayCenterChange: (autoPlay: boolean) => void;
}

// ============================================
// OPTIONS
// ============================================

const aspectRatioOptions: { value: ScaleCarouselAspectRatio; label: string }[] = [
  { value: '3:4', label: '3:4 Portrait' },
  { value: '9:16', label: '9:16 Tall' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function ScaleCarouselConfig({
  items,
  aspectRatio,
  scaleIntensity,
  autoPlayCenter,
  onItemsChange,
  onAspectRatioChange,
  onScaleIntensityChange,
  onAutoPlayCenterChange,
}: ScaleCarouselConfigProps) {
  const addItem = () => {
    const newItem: ScaleCarouselItem = {
      id: crypto.randomUUID(),
      mediaUrl: '',
      label: '',
      isVideo: false,
    };
    onItemsChange([...items, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ScaleCarouselItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    onItemsChange(updated);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatioOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAspectRatioChange(option.value)}
              className={cn(
                'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                aspectRatio === option.value
                  ? 'bg-[var(--primary)] text-[var(--foreground)] border-2 border-[var(--primary)]'
                  : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale Intensity */}
      <div>
        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
          Center Scale: {scaleIntensity.toFixed(1)}x
        </label>
        <input
          type="range"
          min="1"
          max="1.5"
          step="0.1"
          value={scaleIntensity}
          onChange={(e) => onScaleIntensityChange(Number(e.target.value))}
          className="w-full h-2 bg-[var(--admin-border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--admin-text-muted)] mt-1">
          <span>1.0x (none)</span>
          <span>1.5x (max)</span>
        </div>
      </div>

      {/* Auto-play Center Videos */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--admin-text-secondary)]">
          Auto-play centered videos
        </label>
        <button
          type="button"
          onClick={() => onAutoPlayCenterChange(!autoPlayCenter)}
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative',
            autoPlayCenter ? 'bg-[var(--primary)]' : 'bg-[var(--admin-border)]'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
              autoPlayCenter && 'translate-x-5'
            )}
          />
        </button>
      </div>

      {/* Items List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">
            Carousel Items
          </label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-[var(--primary)] hover:text-[var(--foreground)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] mt-1 cursor-grab" />
                <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="ml-auto p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Media */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-2">
                    Media
                  </label>
                  <MediaPickerButton
                    label="Choose Image or Video"
                    value={item.mediaUrl}
                    onChange={(url) => updateItem(index, { mediaUrl: url })}
                    acceptVideo={true}
                  />
                </div>

                {/* Is Video Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--admin-text-muted)]">
                    Force video treatment
                  </label>
                  <button
                    type="button"
                    onClick={() => updateItem(index, { isVideo: !item.isVideo })}
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors relative',
                      item.isVideo ? 'bg-[var(--primary)]' : 'bg-[var(--admin-border)]'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                        item.isVideo && 'translate-x-4'
                      )}
                    />
                  </button>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-2">
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => updateItem(index, { label: e.target.value })}
                    placeholder="Description overlay..."
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-sm text-[var(--admin-text-muted)]">
            No items yet. Click &quot;Add Item&quot; to get started.
          </div>
        )}
      </div>
    </div>
  );
}
