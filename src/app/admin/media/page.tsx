'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Search,
  FolderOpen,
  Grid3X3,
  List,
  Plus,
  Loader2,
  Check,
  Copy,
  Trash2,
  Edit,
  X,
  Upload,
  Link2,
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  FileType,
  HardDrive,
  Video,
  Play,
  Expand,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MediaResponse {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  folderCounts: Record<string, number>;
}

const FOLDERS = [
  { id: 'all', name: 'All Files', icon: FolderOpen },
  { id: 'general', name: 'General', icon: FolderOpen },
  { id: 'products', name: 'Products', icon: FolderOpen },
  { id: 'blog', name: 'Blog', icon: FolderOpen },
  { id: 'hero', name: 'Hero Slides', icon: FolderOpen },
  { id: 'popups', name: 'Pop-ups', icon: FolderOpen },
];

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFolder !== 'all') params.set('folder', selectedFolder);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', page.toString());
      params.set('limit', '50');

      const res = await fetch(`/api/admin/media?${params}`);
      const data: MediaResponse = await res.json();

      setFiles(data.files);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setFolderCounts(data.folderCounts);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, searchQuery, page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeleting(true);
    try {
      await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      setFiles(files.filter((f) => f.id !== id));
      setSelectedFile(null);
      setTotal((t) => t - 1);
    } catch (error) {
      console.error('Failed to delete file:', error);
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTotalCount = () => {
    return Object.values(folderCounts).reduce((sum, count) => sum + count, 0);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await uploadFiles(droppedFiles);
    }
  }, [selectedFolder]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      await uploadFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFolder]);

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    setUploadProgress([]);

    for (const file of filesToUpload) {
      setUploadProgress(prev => [...prev, `Uploading ${file.name}...`]);

      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await fetch('/api/admin/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: dataUrl,
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size,
            folder: selectedFolder === 'all' ? 'general' : selectedFolder,
          }),
        });

        setUploadProgress(prev =>
          prev.map(p => p === `Uploading ${file.name}...` ? `✓ ${file.name}` : p)
        );
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        setUploadProgress(prev =>
          prev.map(p => p === `Uploading ${file.name}...` ? `✗ ${file.name} failed` : p)
        );
      }
    }

    setUploading(false);
    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress([]);
      fetchMedia();
    }, 2000);
  };

  return (
    <div
      ref={dropZoneRef}
      className="space-y-6 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-[var(--admin-bg)]/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[var(--admin-card)] border-2 border-dashed border-[var(--primary)] rounded-2xl p-12 text-center">
            <Upload className="w-16 h-16 text-[var(--primary)] mx-auto mb-4" />
            <p className="text-xl font-medium text-[var(--admin-text-primary)] mb-2">Drop files to upload</p>
            <p className="text-[var(--admin-text-muted)]">Images and videos will be added to your library</p>
          </div>
        </div>
      )}

      {/* Upload progress toast */}
      {uploadProgress.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl shadow-xl p-4 min-w-[300px]">
          <div className="flex items-center gap-3 mb-3">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
            ) : (
              <Check className="w-5 h-5 text-green-400" />
            )}
            <p className="font-medium text-[var(--admin-text-primary)]">
              {uploading ? 'Uploading...' : 'Upload complete'}
            </p>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {uploadProgress.map((msg, i) => (
              <p key={i} className="text-sm text-[var(--admin-text-secondary)]">{msg}</p>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-[var(--admin-text-primary)]">Media Library</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1 text-sm hidden sm:block">
            Drag and drop files anywhere to upload, or manage your media assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)] transition-all text-sm shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium bg-[var(--admin-card)] border border-[var(--admin-border-light)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-all text-sm shrink-0"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Add URL</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-[var(--admin-text-primary)]">{getTotalCount()}</p>
              <p className="text-[10px] sm:text-xs text-[var(--admin-text-muted)]">Total</p>
            </div>
          </div>
        </div>
        {FOLDERS.slice(1, 4).map((folder) => (
          <div key={folder.id} className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-semibold text-[var(--admin-text-primary)]">
                  {folderCounts[folder.id] || 0}
                </p>
                <p className="text-[10px] sm:text-xs text-[var(--admin-text-muted)] truncate">{folder.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Sidebar - horizontal on mobile, vertical on desktop */}
        <div className="lg:w-56 shrink-0">
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setPage(1);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0',
                  selectedFolder === folder.id
                    ? 'bg-[var(--primary)] text-[var(--admin-button-text)] font-medium'
                    : 'bg-[var(--admin-card)] border border-[var(--admin-border-light)] text-[var(--admin-text-secondary)]'
                )}
              >
                {folder.name}
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px]',
                  selectedFolder === folder.id ? 'bg-white/20' : 'bg-[var(--admin-input)]'
                )}>
                  {folder.id === 'all' ? getTotalCount() : folderCounts[folder.id] || 0}
                </span>
              </button>
            ))}
          </div>
          {/* Desktop: vertical list */}
          <div className="hidden lg:block space-y-2">
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setPage(1);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors',
                  selectedFolder === folder.id
                    ? 'bg-[var(--primary)] text-[var(--admin-button-text)] font-medium'
                    : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-input)] hover:text-[var(--admin-text-primary)]'
                )}
              >
                <span className="flex items-center gap-2">
                  <folder.icon className="w-4 h-4" />
                  {folder.name}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    selectedFolder === folder.id
                      ? 'bg-white/20'
                      : 'bg-[var(--admin-border-light)]'
                  )}
                >
                  {folder.id === 'all'
                    ? getTotalCount()
                    : folderCounts[folder.id] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center gap-1 p-1 bg-[var(--admin-card)] rounded-lg border border-[var(--admin-border-light)]">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid'
                    ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                    : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list'
                    ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                    : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Files Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)]">
              <ImageIcon className="w-12 h-12 text-[var(--admin-text-muted)] mb-4" />
              <p className="text-[var(--admin-text-secondary)] mb-2">No files found</p>
              <p className="text-sm text-[var(--admin-text-muted)] mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first media file to get started'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Media
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  onDoubleClick={() => setPreviewFile(file)}
                  className={cn(
                    'group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-[var(--admin-card)] border transition-all',
                    selectedFile?.id === file.id
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30'
                      : 'border-[var(--admin-border-light)] hover:border-[var(--admin-divider)]'
                  )}
                >
                  {file.mimeType?.startsWith('image/') ? (
                    <Image
                      src={file.thumbnailUrl || file.url}
                      alt={file.altText || file.filename}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : file.mimeType?.startsWith('video/') ? (
                    <div className="relative w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                      <video
                        src={file.url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] sm:text-[10px] text-white font-medium">
                        VIDEO
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileType className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--admin-text-muted)]" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] sm:text-xs text-[var(--admin-text-primary)] truncate">{file.filename}</p>
                  </div>
                  {selectedFile?.id === file.id && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[var(--primary)] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--admin-button-text)]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
              <div className="divide-y divide-[var(--admin-border-light)]">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    onDoubleClick={() => setPreviewFile(file)}
                    className={cn(
                      'w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[var(--admin-input)] transition-colors text-left',
                      selectedFile?.id === file.id && 'bg-[var(--primary)]/10'
                    )}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-[var(--admin-input)] shrink-0 relative">
                      {file.mimeType?.startsWith('image/') ? (
                        <Image
                          src={file.thumbnailUrl || file.url}
                          alt={file.altText || file.filename}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : file.mimeType?.startsWith('video/') ? (
                        <>
                          <video
                            src={file.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileType className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--admin-text-muted)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--admin-text-primary)] truncate text-sm sm:text-base">{file.filename}</p>
                      <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">{file.folder}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-[var(--admin-text-secondary)]">{formatFileSize(file.fileSize)}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{formatDate(file.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] hidden sm:block">
                Showing {(page - 1) * 50 + 1}-{Math.min(page * 50, total)} of {total}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] sm:hidden">
                {total} files
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 sm:p-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border-light)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm text-[var(--admin-text-secondary)]">
                  {page}/{totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 sm:p-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border-light)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel - hidden on mobile, shown on desktop */}
        {selectedFile && (
          <div className="hidden lg:block w-80 shrink-0 space-y-4">
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] overflow-hidden">
              {/* Preview */}
              <button
                onClick={() => setPreviewFile(selectedFile)}
                className="aspect-video relative bg-[var(--admin-bg)] w-full group"
              >
                {selectedFile.mimeType?.startsWith('image/') ? (
                  <Image
                    src={selectedFile.url}
                    alt={selectedFile.altText || selectedFile.filename}
                    fill
                    className="object-contain"
                  />
                ) : selectedFile.mimeType?.startsWith('video/') ? (
                  <video
                    src={selectedFile.url}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileType className="w-12 h-12 text-[var(--admin-text-muted)]" />
                  </div>
                )}
                {/* Expand overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Expand className="w-5 h-5 text-gray-800" />
                  </div>
                </div>
              </button>

              {/* Info */}
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-[var(--admin-text-primary)] mb-1 truncate">
                    {selectedFile.filename}
                  </h3>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    {selectedFile.folder || 'general'}
                  </p>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1">URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedFile.url}
                      readOnly
                      className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] truncate"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedFile.url)}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        copied
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                      )}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedFile.width && selectedFile.height && (
                    <div>
                      <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                        Dimensions
                      </label>
                      <p className="text-sm text-[var(--admin-text-primary)]">
                        {selectedFile.width} x {selectedFile.height}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Size</label>
                    <p className="text-sm text-[var(--admin-text-primary)]">
                      {formatFileSize(selectedFile.fileSize)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Type</label>
                    <p className="text-sm text-[var(--admin-text-primary)]">
                      {selectedFile.mimeType || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Added</label>
                    <p className="text-sm text-[var(--admin-text-primary)]">
                      {formatDate(selectedFile.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Alt Text */}
                {selectedFile.altText && (
                  <div>
                    <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                      Alt Text
                    </label>
                    <p className="text-sm text-[var(--admin-text-secondary)]">{selectedFile.altText}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--admin-border-light)]">
                  <button
                    onClick={() => setEditingFile(selectedFile)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm text-[var(--admin-text-primary)] hover:bg-[var(--admin-border-light)] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedFile.id)}
                    disabled={deleting}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile action bar when file is selected */}
      {selectedFile && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl p-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--admin-input)] shrink-0 relative">
              {selectedFile.mimeType?.startsWith('image/') ? (
                <Image
                  src={selectedFile.thumbnailUrl || selectedFile.url}
                  alt={selectedFile.altText || selectedFile.filename}
                  fill
                  className="object-cover"
                />
              ) : selectedFile.mimeType?.startsWith('video/') ? (
                <>
                  <video
                    src={selectedFile.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileType className="w-5 h-5 text-[var(--admin-text-muted)]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate">{selectedFile.filename}</p>
              <p className="text-xs text-[var(--admin-text-muted)]">{formatFileSize(selectedFile.fileSize)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewFile(selectedFile)}
                className="p-2.5 rounded-lg bg-[var(--primary)] text-[var(--admin-button-text)]"
              >
                <Expand className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleCopyUrl(selectedFile.url)}
                className={cn(
                  'p-2.5 rounded-lg transition-colors',
                  copied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-[var(--admin-input)] text-[var(--admin-text-secondary)]'
                )}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleDelete(selectedFile.id)}
                disabled={deleting}
                className="p-2.5 rounded-lg bg-red-500/10 text-red-400 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2.5 rounded-lg bg-[var(--admin-input)] text-[var(--admin-text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchMedia();
        }}
        folders={FOLDERS.slice(1)}
      />

      {/* Edit Media Modal */}
      <EditMediaModal
        file={editingFile}
        onClose={() => setEditingFile(null)}
        onSuccess={() => {
          setEditingFile(null);
          fetchMedia();
        }}
        folders={FOLDERS.slice(1)}
      />

      {/* Preview Modal */}
      <PreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  folders: { id: string; name: string }[];
}

function AddMediaModal({ isOpen, onClose, onSuccess, folders }: AddMediaModalProps) {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [altText, setAltText] = useState('');
  const [folder, setFolder] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          filename: filename || url.split('/').pop() || 'untitled',
          altText,
          folder,
          mimeType: getMimeType(url),
        }),
      });

      if (response.ok) {
        setUrl('');
        setFilename('');
        setAltText('');
        setFolder('general');
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to add media:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMimeType = (url: string): string | null => {
    const ext = url.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      mp4: 'video/mp4',
      webm: 'video/webm',
      pdf: 'application/pdf',
    };
    return types[ext || ''] || null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border-light)] w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[var(--admin-border-light)]">
          <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">Add Media</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Image URL *
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full pl-10 pr-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">
              Enter the full URL of the image or file
            </p>
          </div>

          {url && getMimeType(url)?.startsWith('image/') && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--admin-input)] border border-[var(--admin-border-light)]">
              <Image
                src={url}
                alt="Preview"
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="my-image.jpg"
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Folder
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] hover:bg-[var(--admin-border-light)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url || saving}
              className="flex-1 px-4 py-3 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-xl font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Add Media'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditMediaModalProps {
  file: MediaFile | null;
  onClose: () => void;
  onSuccess: () => void;
  folders: { id: string; name: string }[];
}

function EditMediaModal({ file, onClose, onSuccess, folders }: EditMediaModalProps) {
  const [filename, setFilename] = useState('');
  const [altText, setAltText] = useState('');
  const [folder, setFolder] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (file) {
      setFilename(file.filename);
      setAltText(file.altText || '');
      setFolder(file.folder || 'general');
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setSaving(true);
    try {
      await fetch(`/api/admin/media/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, altText, folder }),
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update media:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border-light)] w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[var(--admin-border-light)]">
          <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">Edit Media</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {file.mimeType?.startsWith('image/') && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--admin-input)] border border-[var(--admin-border-light)]">
              <Image
                src={file.url}
                alt={file.altText || file.filename}
                fill
                className="object-contain"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
              Folder
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-xl text-[var(--admin-text-primary)] hover:bg-[var(--admin-border-light)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-xl font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PreviewModalProps {
  file: MediaFile | null;
  onClose: () => void;
}

function PreviewModal({ file, onClose }: PreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (file) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [file, onClose]);

  if (!file) return null;

  const formatSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* File info */}
      <div className="absolute top-4 left-4 z-10">
        <p className="text-white font-medium">{file.filename}</p>
        <p className="text-white/60 text-sm">
          {file.mimeType} • {formatSize(file.fileSize)}
        </p>
      </div>

      {/* Content */}
      <div className="relative max-w-[90vw] max-h-[90vh]">
        {file.mimeType?.startsWith('image/') ? (
          <Image
            src={file.url}
            alt={file.altText || file.filename}
            width={file.width || 1200}
            height={file.height || 800}
            className="max-w-full max-h-[90vh] object-contain"
            unoptimized
          />
        ) : file.mimeType?.startsWith('video/') ? (
          <video
            src={file.url}
            controls
            autoPlay
            className="max-w-full max-h-[90vh]"
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-[var(--admin-card)] rounded-xl">
            <FileType className="w-16 h-16 text-[var(--admin-text-muted)] mb-4" />
            <p className="text-[var(--admin-text-primary)] font-medium">{file.filename}</p>
            <p className="text-[var(--admin-text-muted)] text-sm mt-1">{file.mimeType}</p>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg text-sm font-medium"
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
