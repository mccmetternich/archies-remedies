'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Play,
  Video,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface VideoTestimonial {
  id: string;
  title: string | null;
  thumbnailUrl: string;
  videoUrl: string;
  name: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface VideoTestimonialsConfigProps {
  videos: VideoTestimonial[];
  onVideosChange: (videos: VideoTestimonial[]) => void;
}

/**
 * Video Testimonials configuration panel.
 * Allows editing video testimonials with thumbnail, video URL, and visibility controls.
 */
export function VideoTestimonialsConfig({
  videos,
  onVideosChange,
}: VideoTestimonialsConfigProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // ─────────────────────────────────────────
  // Video Operations
  // ─────────────────────────────────────────

  const addVideo = () => {
    const newItem: VideoTestimonial = {
      id: `new-${Date.now()}`,
      title: null,
      thumbnailUrl: '',
      videoUrl: '',
      name: null,
      isActive: true,
      sortOrder: videos.length,
    };

    onVideosChange([...videos, newItem]);
    setExpandedItem(newItem.id);
  };

  const updateVideo = (id: string, updates: Partial<VideoTestimonial>) => {
    onVideosChange(videos.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteVideo = (id: string) => {
    onVideosChange(videos.filter((item) => item.id !== id));
    if (expandedItem === id) {
      setExpandedItem(null);
    }
  };

  const reorderVideos = (newOrder: VideoTestimonial[]) => {
    const reordered = newOrder.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    onVideosChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Video List */}
      <Reorder.Group axis="y" values={videos} onReorder={reorderVideos} className="space-y-3">
        {videos.map((item, index) => {
          const isExpanded = expandedItem === item.id;

          return (
            <Reorder.Item key={item.id} value={item} className="list-none">
              <VideoCard
                video={item}
                index={index}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedItem(isExpanded ? null : item.id)}
                onUpdate={(updates) => updateVideo(item.id, updates)}
                onDelete={() => deleteVideo(item.id)}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Add Button */}
      <button
        type="button"
        onClick={addVideo}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--admin-text-muted)] hover:text-[var(--primary)] transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Video Testimonial</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Video Card Component
// ─────────────────────────────────────────

interface VideoCardProps {
  video: VideoTestimonial;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<VideoTestimonial>) => void;
  onDelete: () => void;
}

function VideoCard({
  video,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
}: VideoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if video URL is Vimeo
  const isVimeo = video.videoUrl?.includes('vimeo');

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] border rounded-xl overflow-hidden transition-all',
        isExpanded ? 'border-[var(--primary)]' : 'border-[var(--admin-border)]',
        !video.isActive && 'opacity-60'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--admin-hover)] transition-colors',
          isExpanded && 'border-b border-[var(--admin-border)]'
        )}
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)]">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Thumbnail */}
        <div className="w-16 h-10 rounded-lg overflow-hidden bg-[var(--admin-hover)] flex-shrink-0 relative">
          {video.thumbnailUrl ? (
            <>
              <Image
                src={video.thumbnailUrl}
                alt={video.title || 'Video'}
                width={64}
                height={40}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-4 h-4 text-[var(--admin-text-muted)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--admin-text-primary)] truncate">
              {video.title || video.name || `Video ${index + 1}`}
            </span>
            {isVimeo && (
              <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                Vimeo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            {video.name && (
              <span className="flex items-center gap-0.5">
                <User className="w-3 h-3" />
                {video.name}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Active toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isActive: !video.isActive });
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              video.isActive
                ? 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
                : 'text-amber-500 bg-amber-50'
            )}
            title={video.isActive ? 'Active' : 'Inactive'}
          >
            {video.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (showDeleteConfirm) {
                onDelete();
              } else {
                setShowDeleteConfirm(true);
                setTimeout(() => setShowDeleteConfirm(false), 3000);
              }
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showDeleteConfirm
                ? 'text-white bg-red-500'
                : 'text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50'
            )}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand indicator */}
          <div className="p-1.5 text-[var(--admin-text-muted)]">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-[var(--admin-bg)]">
              {/* Title & Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Title</label>
                  <input
                    type="text"
                    value={video.title || ''}
                    onChange={(e) => onUpdate({ title: e.target.value || null })}
                    placeholder="Video title..."
                    className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Name</label>
                  <input
                    type="text"
                    value={video.name || ''}
                    onChange={(e) => onUpdate({ name: e.target.value || null })}
                    placeholder="Customer name..."
                    className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Thumbnail</label>
                <MediaPickerButton
                  value={video.thumbnailUrl}
                  onChange={(url) => onUpdate({ thumbnailUrl: url || '' })}
                  label="Upload Thumbnail"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Video URL</label>
                <MediaPickerButton
                  value={video.videoUrl}
                  onChange={(url) => onUpdate({ videoUrl: url || '' })}
                  label="Upload Video or paste Vimeo URL"
                  acceptVideo={true}
                  helpText="Supports uploaded MP4/WebM or Vimeo embed URLs"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-[var(--admin-border)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={video.isActive}
                    onChange={(e) => onUpdate({ isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <Eye className="w-4 h-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm text-[var(--admin-text-secondary)]">Active</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
