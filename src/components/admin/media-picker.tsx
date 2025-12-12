'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Search,
  Upload,
  X,
  Check,
  Loader2,
  Link as LinkIcon,
  FolderOpen,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  folder: string | null;
}

interface MediaPickerButtonProps {
  label: string;
  value: string | null;
  onChange: (url: string) => void;
  placeholder?: string;
  helpText?: string;
  aspectRatio?: string;
  folder?: string;
  acceptVideo?: boolean; // Allow video files (mp4, webm)
}

export function MediaPickerButton({
  label,
  value,
  onChange,
  placeholder,
  helpText,
  aspectRatio = '1/1',
  folder,
  acceptVideo = false,
}: MediaPickerButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine file accept types
  const acceptTypes = acceptVideo ? 'image/*,video/mp4,video/webm' : 'image/*';

  // Check if value is a video
  const isVideo = value && (value.includes('video/') || value.endsWith('.mp4') || value.endsWith('.webm'));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Cloudinary via our API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder || 'general');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.file.url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">{label}</label>
      {helpText && <p className="text-xs text-[var(--admin-text-muted)]">{helpText}</p>}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Preview */}
        <div
          className={cn(
            'relative w-full sm:w-24 h-24 rounded-xl bg-[var(--admin-input)] border-2 border-dashed border-[var(--admin-border)] flex items-center justify-center overflow-hidden group shrink-0',
            value && 'border-solid border-[var(--admin-border)]'
          )}
          style={{ aspectRatio }}
        >
          {value ? (
            <>
              {isVideo ? (
                <video
                  src={value}
                  className="w-full h-full object-contain p-2"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={value}
                  alt={label}
                  fill
                  className="object-contain p-2"
                />
              )}
              <button
                onClick={() => onChange('')}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-6 h-6 text-[var(--admin-text-muted)]" />
          )}
        </div>

        {/* Upload Options */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Browse Library
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload
            </button>
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              URL
            </button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                placeholder={placeholder || 'https://...'}
                className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                Set
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Library Modal - Don't filter by folder, show all media for browsing */}
      {showModal && (
        <MediaLibraryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={(url) => {
            onChange(url);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Don't filter by folder - always show all media in library
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100'); // Increased limit for better browsing

      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border)] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)] shrink-0">
          <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">Select from Media Library</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--admin-border)] shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="w-12 h-12 text-[var(--admin-text-muted)] mb-4" />
              <p className="text-[var(--admin-text-secondary)] mb-2">No media found</p>
              <p className="text-sm text-[var(--admin-text-muted)]">
                {searchQuery ? 'Try a different search term' : 'Add media to your library first'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {files.map((file) => {
                const isVideo = file.mimeType?.startsWith('video/') ||
                  file.url?.match(/\.(mp4|webm|mov)$/i);

                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={cn(
                      'group relative aspect-square rounded-xl overflow-hidden bg-[var(--admin-input)] border-2 transition-all',
                      selectedFile?.id === file.id
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30'
                        : 'border-transparent hover:border-[var(--admin-border)]'
                    )}
                  >
                    {isVideo ? (
                      <>
                        {/* Video thumbnail with autoplay on hover */}
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                          <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : file.mimeType?.startsWith('image/') ? (
                      <Image
                        src={file.thumbnailUrl || file.url}
                        alt={file.filename}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-8 h-8 text-[var(--admin-text-muted)]" />
                      </div>
                    )}
                    {selectedFile?.id === file.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-[var(--admin-button-text)]" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">{file.filename}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--admin-border)] bg-[var(--admin-input)] shrink-0">
          <p className="text-sm text-[var(--admin-text-muted)]">
            {selectedFile ? `Selected: ${selectedFile.filename}` : 'Click an image to select'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedFile && onSelect(selectedFile.url)}
              disabled={!selectedFile}
              className="px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
