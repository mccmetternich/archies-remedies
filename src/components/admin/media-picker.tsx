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
  Pause,
  Music,
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
  acceptAudio?: boolean; // Allow audio files (mp3, wav, etc.)
  buttonText?: string; // Custom text for the upload button
  compact?: boolean; // Compact mode with smaller buttons
}

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function MediaPickerButton({
  label,
  value,
  onChange,
  placeholder,
  helpText,
  aspectRatio = '1/1',
  folder,
  acceptVideo = false,
  acceptAudio = false,
  buttonText,
  compact = false,
}: MediaPickerButtonProps) {
  // Debug: log when rendering with label to identify which instance
  console.log('[MediaPickerButton] Rendering:', label, 'value:', value ? value.substring(0, 50) + '...' : value);

  const [showModal, setShowModal] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use ref to always have access to the latest onChange callback
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Determine file accept types
  const getAcceptTypes = () => {
    const types = ['image/*'];
    if (acceptVideo) types.push('video/mp4', 'video/webm');
    if (acceptAudio) types.push('audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/*');
    return types.join(',');
  };
  const acceptTypes = getAcceptTypes();

  // Check if value is a video - check extension, Cloudinary path, and mime type pattern
  const isVideo = value && (
    value.includes('/video/upload/') ||
    value.match(/\.(mp4|webm|mov)(\?|$)/i) ||
    value.includes('video/')
  );

  // Check if value is an audio file
  const isAudio = value && (
    value.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i) ||
    value.includes('/audio/') ||
    value.includes('audio/')
  );

  // Audio preview state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Toggle audio playback
  const toggleAudioPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Reset audio state when value changes
  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [value]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  // Clear error message after 10 seconds (longer so user can read it)
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setUploadError(null);
    setUploadSuccess(false);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    console.log('[MediaPicker] Starting direct Cloudinary upload:', { fileName: file.name, fileSize: file.size, folder });

    try {
      // Step 1: Get signed upload credentials from our server
      console.log('[MediaPicker] Getting upload signature...');
      const signatureRes = await fetch('/api/admin/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: folder || 'general' }),
      });

      if (!signatureRes.ok) {
        const errorData = await signatureRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get upload credentials');
      }

      const { signature, timestamp, cloudName, apiKey, folder: folderPath } = await signatureRes.json();
      console.log('[MediaPicker] Got signature, uploading to Cloudinary...');

      // Step 2: Upload directly to Cloudinary (bypasses Vercel body size limit)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folderPath);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryRes.ok) {
        const errorData = await cloudinaryRes.json().catch(() => ({}));
        console.error('[MediaPicker] Cloudinary error:', errorData);
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const cloudinaryData = await cloudinaryRes.json();
      console.log('[MediaPicker] Cloudinary upload success:', cloudinaryData.public_id);

      // Step 3: Register the file in our database
      console.log('[MediaPicker] Registering file in database...');
      const registerRes = await fetch('/api/admin/upload/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: cloudinaryData.public_id,
          secure_url: cloudinaryData.secure_url,
          original_filename: file.name,
          format: cloudinaryData.format,
          resource_type: cloudinaryData.resource_type,
          bytes: cloudinaryData.bytes,
          width: cloudinaryData.width,
          height: cloudinaryData.height,
          folder: folder || 'general',
        }),
      });

      if (!registerRes.ok) {
        // File uploaded but not registered - show warning to user
        const registerError = await registerRes.json().catch(() => ({}));
        console.error('[MediaPicker] Failed to register file in database:', registerError);
        console.warn('[MediaPicker] File is uploaded to Cloudinary but NOT saved to media library');
        // Show error to user so they know the file won't appear in library
        setUploadError(`File uploaded but NOT saved to media library: ${registerError.details || 'Database error'}. The URL can still be used directly.`);
      }

      console.log('[MediaPicker] Upload complete:', cloudinaryData.secure_url);
      onChange(cloudinaryData.secure_url);
      setUploadSuccess(true);
    } catch (error) {
      console.error('[MediaPicker] Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  };

  // Compact mode - just a button for avatar uploads
  if (compact) {
    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">{label}</label>}
        {helpText && <p className="text-xs text-[var(--admin-text-muted)]">{helpText}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-xs hover:bg-[var(--admin-hover)] transition-colors disabled:opacity-50 border border-[var(--admin-border-light)]"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {buttonText || 'Upload'}
        </button>

        {/* Upload Status Messages */}
        {uploadError && (
          <div className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
            <X className="w-3 h-3 shrink-0" />
            <span className="truncate">{uploadError}</span>
          </div>
        )}
        {uploadSuccess && (
          <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
            <Check className="w-3 h-3 shrink-0" />
            <span>Done!</span>
          </div>
        )}

        {/* Media Library Modal */}
        {showModal && (
          <MediaLibraryModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSelect={(url) => {
              onChangeRef.current(url);
              setShowModal(false);
            }}
            filterType={acceptAudio ? 'audio' : acceptVideo ? 'video' : null}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-[var(--admin-text-secondary)]">{label}</label>}
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
              {isAudio ? (
                /* Audio preview with play button */
                <div className="w-full h-full flex flex-col items-center justify-center p-2 gap-2">
                  <audio
                    ref={audioRef}
                    src={value}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <Music className="w-6 h-6 text-[var(--admin-text-muted)]" />
                  <button
                    onClick={toggleAudioPlayback}
                    className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center hover:bg-[var(--primary-dark)] transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                </div>
              ) : isVideo ? (
                <video
                  src={value}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedData={(e) => {
                    // Seek to first frame to show thumbnail
                    const video = e.currentTarget;
                    if (video.readyState >= 2) {
                      video.currentTime = 0.1;
                    }
                  }}
                />
              ) : (
                <Image
                  src={value}
                  alt={label || 'Preview'}
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
              {buttonText || 'Upload'}
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

          {/* Upload Status Messages */}
          {uploadError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              <X className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          {uploadSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
              <Check className="w-4 h-4 shrink-0" />
              <span>Upload complete!</span>
            </div>
          )}
        </div>
      </div>

      {/* Media Library Modal - Filter by type when audio/video only */}
      {showModal && (
        <MediaLibraryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={(url) => {
            console.log('[MediaPicker] Selected from library for:', label, 'url:', url);
            onChangeRef.current(url);
            setShowModal(false);
          }}
          filterType={acceptAudio ? 'audio' : acceptVideo ? 'video' : null}
        />
      )}
    </div>
  );
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  filterType?: 'audio' | 'video' | 'image' | null; // Filter by media type
}

function MediaLibraryModal({ isOpen, onClose, onSelect, filterType }: MediaLibraryModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Don't filter by folder - always show all media in library
      if (searchQuery) params.set('search', searchQuery);
      if (filterType) params.set('type', filterType);
      params.set('limit', '100'); // Increased limit for better browsing

      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();

      // Client-side filter as backup if API doesn't support type filter
      let filteredFiles = data.files || [];
      if (filterType === 'audio') {
        filteredFiles = filteredFiles.filter((f: MediaFile) =>
          f.mimeType?.startsWith('audio/') ||
          f.url?.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i)
        );
      } else if (filterType === 'video') {
        filteredFiles = filteredFiles.filter((f: MediaFile) =>
          f.mimeType?.startsWith('video/') ||
          f.url?.match(/\.(mp4|webm|mov)(\?|$)/i)
        );
      } else if (filterType === 'image') {
        filteredFiles = filteredFiles.filter((f: MediaFile) =>
          f.mimeType?.startsWith('image/')
        );
      }

      setFiles(filteredFiles);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType]);

  // Toggle audio playback in library
  const toggleLibraryAudio = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRefs.current[fileId];
    if (!audio) return;

    if (playingAudioId === fileId) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      // Stop any currently playing audio
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId]?.pause();
      }
      audio.play();
      setPlayingAudioId(fileId);
    }
  };

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
                const isFileVideo = file.mimeType?.startsWith('video/') ||
                  file.url?.match(/\.(mp4|webm|mov)$/i);
                const isFileAudio = file.mimeType?.startsWith('audio/') ||
                  file.url?.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i);

                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    onDoubleClick={() => onSelect(file.url)}
                    className={cn(
                      'group relative aspect-square rounded-xl overflow-hidden bg-[var(--admin-input)] border-2 transition-all',
                      selectedFile?.id === file.id
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30'
                        : 'border-transparent hover:border-[var(--admin-border)]'
                    )}
                  >
                    {isFileAudio ? (
                      <>
                        {/* Audio file with play button */}
                        <audio
                          ref={(el) => { audioRefs.current[file.id] = el; }}
                          src={file.url}
                          onEnded={() => setPlayingAudioId(null)}
                          className="hidden"
                        />
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <Music className="w-8 h-8 text-[var(--admin-text-muted)]" />
                          <div
                            onClick={(e) => toggleLibraryAudio(file.id, e)}
                            className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
                          >
                            {playingAudioId === file.id ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </div>
                        </div>
                      </>
                    ) : isFileVideo ? (
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
            {selectedFile ? `Selected: ${selectedFile.filename}` : 'Click to select, double-click to apply instantly'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedFile) {
                  console.log('[MediaLibrary] Select button clicked, file:', selectedFile.url);
                  onSelect(selectedFile.url);
                }
              }}
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
