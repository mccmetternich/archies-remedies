'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  FileText,
  Layout,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Page {
  id: string;
  slug: string;
  title: string;
  pageType: string | null;
  isActive: boolean | null;
  showInNav: boolean | null;
  updatedAt: string | null;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;

    try {
      await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
      setPages(pages.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getPageTypeIcon = (type: string | null) => {
    switch (type) {
      case 'landing':
        return <Layout className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPageTypeLabel = (type: string | null) => {
    switch (type) {
      case 'landing':
        return 'Landing Page';
      case 'product':
        return 'Product Page';
      default:
        return 'Content Page';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Pages</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Create and manage site pages
          </p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Page
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--primary-dark)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pages.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Total Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {pages.filter((p) => p.isActive).length}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Layout className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {pages.filter((p) => p.pageType === 'landing').length}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">Landing Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--muted)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Page
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Updated
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--muted-foreground)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-[var(--muted)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center">
                      {getPageTypeIcon(page.pageType)}
                    </div>
                    <div>
                      <h3 className="font-medium">{page.title}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">/{page.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs bg-[var(--secondary)] rounded-full">
                    {getPageTypeLabel(page.pageType)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {page.isActive ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Eye className="w-4 h-4" /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <EyeOff className="w-4 h-4" /> Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)] text-sm">
                  {page.updatedAt
                    ? new Date(page.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-[var(--muted-foreground)]" />
                    </a>
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                    >
                      <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                    </Link>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="font-medium mb-2">No pages yet</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Create your first page to get started
            </p>
            <Link href="/admin/pages/new">
              <Button variant="outline">
                <Plus className="w-4 h-4" />
                Create Page
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
