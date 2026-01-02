'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Globe, FileText, Package, ExternalLink, Search, Newspaper } from 'lucide-react';

// Static pages that always exist
const STATIC_PAGES = [
  { slug: '/', label: 'Home', icon: 'page' },
  { slug: '/about', label: 'About', icon: 'page' },
  { slug: '/our-story', label: 'Our Story', icon: 'page' },
  { slug: '/contact', label: 'Contact', icon: 'page' },
  { slug: '/faq', label: 'FAQ', icon: 'page' },
  { slug: '/blog', label: 'Blog', icon: 'page' },
  { slug: '/privacy', label: 'Privacy Policy', icon: 'page' },
  { slug: '/terms', label: 'Terms of Service', icon: 'page' },
];

interface PageOption {
  slug: string;
  label: string;
  icon: 'page' | 'product' | 'custom' | 'blog';
}

interface InternalLinkSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function InternalLinkSelector({
  value,
  onChange,
  placeholder = 'Select or enter URL',
  label,
  className = '',
}: InternalLinkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pages, setPages] = useState<PageOption[]>([]);
  const [products, setProducts] = useState<PageOption[]>([]);
  const [customPages, setCustomPages] = useState<PageOption[]>([]);
  const [blogPosts, setBlogPosts] = useState<PageOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch pages, products, and blog posts on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pagesRes, productsRes, blogRes] = await Promise.all([
          fetch('/api/admin/pages'),
          fetch('/api/admin/products'),
          fetch('/api/admin/blog/posts'),
        ]);

        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          const customPageOptions: PageOption[] = pagesData
            .filter((p: { isActive: boolean }) => p.isActive)
            .map((p: { slug: string; title: string }) => ({
              slug: `/${p.slug}`,
              label: p.title,
              icon: 'custom' as const,
            }));
          setCustomPages(customPageOptions);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const productOptions: PageOption[] = productsData
            .filter((p: { isActive: boolean }) => p.isActive)
            .map((p: { slug: string; name: string }) => ({
              slug: `/products/${p.slug}`,
              label: p.name,
              icon: 'product' as const,
            }));
          setProducts(productOptions);
        }

        if (blogRes.ok) {
          const blogData = await blogRes.json();
          const posts = blogData.posts || blogData;
          const blogOptions: PageOption[] = (Array.isArray(posts) ? posts : [])
            .filter((p: { isPublished: boolean }) => p.isPublished)
            .map((p: { slug: string; title: string }) => ({
              slug: `/blog/${p.slug}`,
              label: p.title,
              icon: 'blog' as const,
            }));
          setBlogPosts(blogOptions);
        }
      } catch (error) {
        console.error('Failed to fetch pages/products/blog:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine all pages
  useEffect(() => {
    const allPages = [
      ...STATIC_PAGES.map(p => ({ ...p, icon: 'page' as const })),
      ...customPages,
      ...products,
      ...blogPosts,
    ];
    setPages(allPages);
  }, [customPages, products, blogPosts]);

  // Filter pages based on search
  const filteredPages = pages.filter(page =>
    page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered pages
  const staticFiltered = filteredPages.filter(p => STATIC_PAGES.some(sp => sp.slug === p.slug));
  const customFiltered = filteredPages.filter(p => p.icon === 'custom');
  const productFiltered = filteredPages.filter(p => p.icon === 'product');
  const blogFiltered = filteredPages.filter(p => p.icon === 'blog');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display value
  const getDisplayValue = () => {
    if (!value) return '';
    const page = pages.find(p => p.slug === value);
    return page ? page.label : value;
  };

  const handleSelect = (slug: string) => {
    onChange(slug);
    setIsOpen(false);
    setSearchQuery('');
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isEditing) {
      onChange(newValue);
    }
    setSearchQuery(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // If there's a search query and user presses enter, use it as custom URL
      if (searchQuery) {
        onChange(searchQuery);
        setIsOpen(false);
        setSearchQuery('');
        setIsEditing(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      setIsEditing(false);
    }
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'product':
        return <Package className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />;
      case 'custom':
        return <FileText className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />;
      case 'blog':
        return <Newspaper className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs text-[var(--admin-text-muted)] mb-1">{label}</label>
      )}

      <div className="relative">
        {/* Main input/button */}
        <div
          className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-sm cursor-pointer hover:border-[var(--primary)] transition-colors"
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          {isOpen || isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={isEditing ? value || '' : searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)]"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`flex-1 truncate ${value ? 'text-[var(--admin-text-primary)]' : 'text-[var(--admin-text-placeholder)]'}`}>
              {getDisplayValue() || placeholder}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-[var(--admin-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[var(--admin-card)] border border-[var(--admin-border-light)] rounded-xl shadow-lg overflow-hidden">
            {/* Search hint */}
            {!searchQuery && (
              <div className="px-3 py-2 border-b border-[var(--admin-border-light)] bg-[var(--admin-bg)]">
                <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                  <Search className="w-3 h-3" />
                  <span>Search or type custom URL</span>
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-4 text-sm text-center text-[var(--admin-text-muted)]">
                  Loading...
                </div>
              ) : filteredPages.length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-[var(--admin-text-muted)]">
                  {searchQuery ? (
                    <div className="space-y-2">
                      <p>No matches found</p>
                      <button
                        onClick={() => handleSelect(searchQuery)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-hover)] rounded-lg text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border-light)] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Use &quot;{searchQuery}&quot;
                      </button>
                    </div>
                  ) : (
                    'No pages available'
                  )}
                </div>
              ) : (
                <>
                  {/* Static Pages */}
                  {staticFiltered.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)] bg-[var(--admin-bg)]">
                        Pages
                      </div>
                      {staticFiltered.map((page) => (
                        <button
                          key={page.slug}
                          onClick={() => handleSelect(page.slug)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[var(--admin-hover)] transition-colors ${
                            value === page.slug ? 'bg-[var(--admin-hover)]' : ''
                          }`}
                        >
                          {getIcon(page.icon)}
                          <span className="flex-1 text-[var(--admin-text-primary)]">{page.label}</span>
                          <span className="text-xs text-[var(--admin-text-muted)]">{page.slug}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom Pages */}
                  {customFiltered.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)] bg-[var(--admin-bg)]">
                        Custom Pages
                      </div>
                      {customFiltered.map((page) => (
                        <button
                          key={page.slug}
                          onClick={() => handleSelect(page.slug)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[var(--admin-hover)] transition-colors ${
                            value === page.slug ? 'bg-[var(--admin-hover)]' : ''
                          }`}
                        >
                          {getIcon(page.icon)}
                          <span className="flex-1 text-[var(--admin-text-primary)]">{page.label}</span>
                          <span className="text-xs text-[var(--admin-text-muted)]">{page.slug}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {productFiltered.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)] bg-[var(--admin-bg)]">
                        Products
                      </div>
                      {productFiltered.map((page) => (
                        <button
                          key={page.slug}
                          onClick={() => handleSelect(page.slug)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[var(--admin-hover)] transition-colors ${
                            value === page.slug ? 'bg-[var(--admin-hover)]' : ''
                          }`}
                        >
                          {getIcon(page.icon)}
                          <span className="flex-1 text-[var(--admin-text-primary)]">{page.label}</span>
                          <span className="text-xs text-[var(--admin-text-muted)]">{page.slug}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Blog Posts */}
                  {blogFiltered.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)] bg-[var(--admin-bg)]">
                        Blog Posts
                      </div>
                      {blogFiltered.map((page) => (
                        <button
                          key={page.slug}
                          onClick={() => handleSelect(page.slug)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[var(--admin-hover)] transition-colors ${
                            value === page.slug ? 'bg-[var(--admin-hover)]' : ''
                          }`}
                        >
                          {getIcon(page.icon)}
                          <span className="flex-1 text-[var(--admin-text-primary)]">{page.label}</span>
                          <span className="text-xs text-[var(--admin-text-muted)]">{page.slug}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom URL option when searching */}
                  {searchQuery && !pages.some(p => p.slug === searchQuery) && (
                    <div className="border-t border-[var(--admin-border-light)]">
                      <button
                        onClick={() => handleSelect(searchQuery)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-[var(--admin-hover)] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
                        <span className="flex-1 text-[var(--admin-text-primary)]">Use custom URL</span>
                        <span className="text-xs text-[var(--admin-text-muted)]">{searchQuery}</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
