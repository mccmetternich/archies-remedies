'use client';

import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  GripVertical,
  Play,
  ImageIcon,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

// ============================================
// TYPES
// ============================================

export interface MediaCarouselItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

interface MediaCarouselConfigProps {
  items: MediaCarouselItem[];
  onItemsChange: (items: MediaCarouselItem[]) => void;
}

// ============================================
// HELPERS
// ============================================

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.m4v', '.ogv', '.ogg'];
  return videoExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes('/video/upload/');
}

const MAX_ITEMS = 10;

// ============================================
// MAIN COMPONENT
// ============================================

export function MediaCarouselConfig({
  items,
  onItemsChange,
}: MediaCarouselConfigProps) {
  // ─────────────────────────────────────────
  // Item Operations
  // ─────────────────────────────────────────

  const addItem = () => {
    if (items.length >= MAX_ITEMS) return;

    const newItem: MediaCarouselItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: '',
      type: 'image',
      alt: '',
    };

    onItemsChange([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<MediaCarouselItem>) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const reorderItems = (newOrder: MediaCarouselItem[]) => {
    onItemsChange(newOrder);
  };

  const handleMediaChange = (id: string, url: string) => {
    const type: 'image' | 'video' = isVideoUrl(url) ? 'video' : 'image';
    updateItem(id, { url, type });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-[var(--admin-text-primary)]">
            Media Items
          </h4>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            Drag to reorder. Max {MAX_ITEMS} items.
          </p>
        </div>
        <span className="text-xs text-[var(--admin-text-muted)] bg-[var(--admin-hover)] px-2 py-1 rounded">
          {items.length} / {MAX_ITEMS}
        </span>
      </div>

      {/* Media List */}
      {items.length > 0 ? (
        <Reorder.Group axis="y" values={items} onReorder={reorderItems} className="space-y-2">
          {items.map((item, index) => (
            <Reorder.Item key={item.id} value={item} className="list-none">
              <MediaItemCard
                item={item}
                index={index}
                onUpdate={(updates) => updateItem(item.id, updates)}
                onMediaChange={(url) => handleMediaChange(item.id, url)}
                onDelete={() => deleteItem(item.id)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="text-center py-8 text-[var(--admin-text-muted)] bg-[var(--admin-hover)] rounded-xl border border-dashed border-[var(--admin-border)]">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No media items yet</p>
          <p className="text-xs mt-1">Add images or videos to create your carousel</p>
        </div>
      )}

      {/* Add Button */}
      <button
        type="button"
        onClick={addItem}
        disabled={items.length >= MAX_ITEMS}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed rounded-xl transition-colors',
          items.length >= MAX_ITEMS
            ? 'border-[var(--admin-border)] text-[var(--admin-text-muted)] opacity-50 cursor-not-allowed'
            : 'border-[var(--admin-border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--admin-text-muted)] hover:text-[var(--primary)]'
        )}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">
          {items.length >= MAX_ITEMS ? 'Maximum items reached' : 'Add Media'}
        </span>
      </button>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>The first video will auto-play when visible</li>
          <li>Use 4:5 portrait images/videos for best results</li>
          <li>Supported formats: JPG, PNG, MP4, WebM</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================
// MEDIA ITEM CARD
// ============================================

interface MediaItemCardProps {
  item: MediaCarouselItem;
  index: number;
  onUpdate: (updates: Partial<MediaCarouselItem>) => void;
  onMediaChange: (url: string) => void;
  onDelete: () => void;
}

function MediaItemCard({
  item,
  index,
  onUpdate: _onUpdate,
  onMediaChange,
  onDelete,
}: MediaItemCardProps) {
  // _onUpdate available for future use (e.g., alt text editing)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isVideo = item.type === 'video' || isVideoUrl(item.url);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3',
        'bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl',
        'hover:border-[var(--primary)]/50 transition-colors'
      )}
    >
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)]">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Thumbnail Preview */}
      <div className="w-16 h-20 rounded-lg overflow-hidden bg-[var(--admin-hover)] flex-shrink-0 relative">
        {item.url ? (
          <>
            {isVideo ? (
              <video
                src={item.url}
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            ) : (
              <Image
                src={item.url}
                alt={item.alt || `Media ${index + 1}`}
                width={64}
                height={80}
                className="w-full h-full object-cover"
              />
            )}
            {/* Video indicator overlay */}
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </div>
        )}
      </div>

      {/* Info & Upload */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-[var(--admin-text-primary)]">
            {index === 0 ? 'First (Auto-plays)' : `Item ${index + 1}`}
          </span>
          {isVideo ? (
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Video className="w-3 h-3" />
              Video
            </span>
          ) : item.url ? (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Image
            </span>
          ) : null}
        </div>

        {/* Media Picker */}
        <MediaPickerButton
          label="Upload or select media"
          value={item.url}
          onChange={onMediaChange}
          acceptVideo={true}
          aspectRatio="4/5"
          folder="media-carousel"
          compact={true}
        />
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => {
          if (showDeleteConfirm) {
            onDelete();
          } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
          }
        }}
        className={cn(
          'p-2 rounded-lg transition-colors flex-shrink-0',
          showDeleteConfirm
            ? 'text-white bg-red-500'
            : 'text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50'
        )}
        title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
