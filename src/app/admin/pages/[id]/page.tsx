'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Layout,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  Type,
  Image as ImageIcon,
  Quote,
  Star,
  MessageSquare,
  HelpCircle,
  Instagram,
  PlayCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/admin/rich-text-editor';

interface PageWidget {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  config?: Record<string, any>;
  isVisible: boolean;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  pageType: string;
  content: string | null;
  widgets: string | null;
  heroImageUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  showInNav: boolean;
  navOrder: number;
}

const WIDGET_TYPES = [
  { type: 'hero', label: 'Hero Section', icon: ImageIcon },
  { type: 'text', label: 'Text Block', icon: Type },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'testimonials', label: 'Testimonials', icon: Star },
  { type: 'faqs', label: 'FAQs', icon: HelpCircle },
  { type: 'contact_form', label: 'Contact Form', icon: MessageSquare },
  { type: 'instagram', label: 'Instagram Feed', icon: Instagram },
  { type: 'video', label: 'Video', icon: PlayCircle },
  { type: 'cta', label: 'Call to Action', icon: Layout },
];

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'widgets' | 'seo'>('content');
  const [page, setPage] = useState<PageData>({
    id: '',
    slug: '',
    title: '',
    pageType: 'content',
    content: '',
    widgets: null,
    heroImageUrl: null,
    heroTitle: null,
    heroSubtitle: null,
    metaTitle: null,
    metaDescription: null,
    isActive: true,
    showInNav: false,
    navOrder: 0,
  });
  const [widgets, setWidgets] = useState<PageWidget[]>([]);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    }
  }, [id, isNew]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`);
      const data = await res.json();
      setPage(data);
      if (data.widgets) {
        try {
          setWidgets(JSON.parse(data.widgets));
        } catch {
          setWidgets([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...page,
        widgets: page.pageType === 'landing' ? JSON.stringify(widgets) : null,
      };

      if (isNew) {
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        router.push(`/admin/pages/${data.id}`);
      } else {
        await fetch(`/api/admin/pages/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddWidget = (type: string) => {
    const newWidget: PageWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: '',
      subtitle: '',
      content: '',
      config: {},
      isVisible: true,
    };
    setWidgets([...widgets, newWidget]);
    setExpandedWidget(newWidget.id);
    setShowWidgetPicker(false);
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<PageWidget>) => {
    setWidgets(widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)));
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (confirm('Delete this widget?')) {
      setWidgets(widgets.filter((w) => w.id !== widgetId));
    }
  };

  const handleReorderWidgets = (newOrder: PageWidget[]) => {
    setWidgets(newOrder);
  };

  const getWidgetIcon = (type: string) => {
    const widget = WIDGET_TYPES.find((w) => w.type === type);
    return widget?.icon || FileText;
  };

  const getWidgetLabel = (type: string) => {
    const widget = WIDGET_TYPES.find((w) => w.type === type);
    return widget?.label || type;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pages"
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium">
              {isNew ? 'New Page' : page.title || 'Edit Page'}
            </h1>
            {!isNew && page.slug && (
              <p className="text-[var(--muted-foreground)]">/{page.slug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={page.isActive}
              onChange={(e) => setPage({ ...page, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium flex items-center gap-1">
              {page.isActive ? (
                <>
                  <Eye className="w-4 h-4" /> Published
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" /> Draft
                </>
              )}
            </span>
          </label>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            {isNew ? 'Create Page' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'content'
              ? 'border-[var(--foreground)] text-[var(--foreground)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Content
        </button>
        {page.pageType === 'landing' && (
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'widgets'
                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Layout className="w-4 h-4 inline mr-2" />
            Widgets ({widgets.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'seo'
              ? 'border-[var(--foreground)] text-[var(--foreground)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          SEO
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Page Title</label>
                <Input
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  placeholder="About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted-foreground)]">/</span>
                  <Input
                    value={page.slug}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    placeholder="about-us"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Page Type</label>
                <select
                  value={page.pageType}
                  onChange={(e) => setPage({ ...page, pageType: e.target.value })}
                  className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base"
                >
                  <option value="content">Content Page (Simple)</option>
                  <option value="landing">Landing Page (With Widgets)</option>
                </select>
              </div>

              {page.pageType === 'content' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <RichTextEditor
                    value={page.content || ''}
                    onChange={(value) => setPage({ ...page, content: value })}
                  />
                </div>
              )}

              {page.pageType === 'landing' && (
                <div className="p-4 bg-[var(--muted)] rounded-lg">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    This is a landing page. Use the Widgets tab to add and configure page sections.
                  </p>
                </div>
              )}
            </div>

            {/* Hero Section for Landing Pages */}
            {page.pageType === 'landing' && (
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
                <h3 className="font-medium">Hero Section</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">Hero Title</label>
                  <Input
                    value={page.heroTitle || ''}
                    onChange={(e) => setPage({ ...page, heroTitle: e.target.value })}
                    placeholder="Welcome to Our Page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
                  <Input
                    value={page.heroSubtitle || ''}
                    onChange={(e) => setPage({ ...page, heroSubtitle: e.target.value })}
                    placeholder="A brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hero Image URL</label>
                  <Input
                    value={page.heroImageUrl || ''}
                    onChange={(e) => setPage({ ...page, heroImageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
              <h3 className="font-medium">Settings</h3>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={page.showInNav}
                  onChange={(e) => setPage({ ...page, showInNav: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Show in navigation</span>
              </label>

              {page.showInNav && (
                <div>
                  <label className="block text-sm font-medium mb-1">Nav Order</label>
                  <Input
                    type="number"
                    value={page.navOrder}
                    onChange={(e) => setPage({ ...page, navOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Widgets Tab */}
      {activeTab === 'widgets' && page.pageType === 'landing' && (
        <div className="space-y-6">
          {/* Widget List */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between">
              <h3 className="font-medium">Page Widgets</h3>
              <Button variant="outline" size="sm" onClick={() => setShowWidgetPicker(true)}>
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            </div>

            {widgets.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={widgets}
                onReorder={handleReorderWidgets}
                className="divide-y divide-[var(--border-light)]"
              >
                {widgets.map((widget) => {
                  const Icon = getWidgetIcon(widget.type);
                  const isExpanded = expandedWidget === widget.id;

                  return (
                    <Reorder.Item
                      key={widget.id}
                      value={widget}
                      className="bg-[var(--card)]"
                    >
                      <div className="p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />

                        <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">
                            {widget.title || getWidgetLabel(widget.type)}
                          </h4>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {getWidgetLabel(widget.type)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={widget.isVisible}
                              onChange={(e) =>
                                handleUpdateWidget(widget.id, { isVisible: e.target.checked })
                              }
                              className="rounded"
                            />
                            <span className="text-xs text-[var(--muted-foreground)]">Visible</span>
                          </label>
                          <button
                            onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
                            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteWidget(widget.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Widget Editor */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 border-t border-[var(--border-light)] bg-[var(--muted)]"
                        >
                          <div className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input
                                  value={widget.title || ''}
                                  onChange={(e) =>
                                    handleUpdateWidget(widget.id, { title: e.target.value })
                                  }
                                  placeholder="Widget title"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Subtitle</label>
                                <Input
                                  value={widget.subtitle || ''}
                                  onChange={(e) =>
                                    handleUpdateWidget(widget.id, { subtitle: e.target.value })
                                  }
                                  placeholder="Widget subtitle"
                                />
                              </div>
                            </div>

                            {(widget.type === 'text' || widget.type === 'quote') && (
                              <div>
                                <label className="block text-sm font-medium mb-1">Content</label>
                                <RichTextEditor
                                  value={widget.content || ''}
                                  onChange={(value) =>
                                    handleUpdateWidget(widget.id, { content: value })
                                  }
                                />
                              </div>
                            )}

                            {(widget.type === 'image' || widget.type === 'hero') && (
                              <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <Input
                                  value={widget.config?.imageUrl || ''}
                                  onChange={(e) =>
                                    handleUpdateWidget(widget.id, {
                                      config: { ...widget.config, imageUrl: e.target.value },
                                    })
                                  }
                                  placeholder="https://..."
                                />
                              </div>
                            )}

                            {widget.type === 'video' && (
                              <div>
                                <label className="block text-sm font-medium mb-1">Video URL</label>
                                <Input
                                  value={widget.config?.videoUrl || ''}
                                  onChange={(e) =>
                                    handleUpdateWidget(widget.id, {
                                      config: { ...widget.config, videoUrl: e.target.value },
                                    })
                                  }
                                  placeholder="https://vimeo.com/..."
                                />
                              </div>
                            )}

                            {widget.type === 'cta' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Button Text
                                  </label>
                                  <Input
                                    value={widget.config?.buttonText || ''}
                                    onChange={(e) =>
                                      handleUpdateWidget(widget.id, {
                                        config: { ...widget.config, buttonText: e.target.value },
                                      })
                                    }
                                    placeholder="Shop Now"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Button URL
                                  </label>
                                  <Input
                                    value={widget.config?.buttonUrl || ''}
                                    onChange={(e) =>
                                      handleUpdateWidget(widget.id, {
                                        config: { ...widget.config, buttonUrl: e.target.value },
                                      })
                                    }
                                    placeholder="/products"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            ) : (
              <div className="py-12 text-center">
                <Layout className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
                <h3 className="font-medium mb-2">No widgets yet</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Add widgets to build your landing page
                </p>
                <Button variant="outline" onClick={() => setShowWidgetPicker(true)}>
                  <Plus className="w-4 h-4" />
                  Add Widget
                </Button>
              </div>
            )}
          </div>

          {/* Widget Picker Modal */}
          {showWidgetPicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowWidgetPicker(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
              >
                <div className="p-6 border-b border-[var(--border)]">
                  <h2 className="text-xl font-medium">Add Widget</h2>
                  <p className="text-[var(--muted-foreground)] mt-1">
                    Choose a widget type to add to your page
                  </p>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {WIDGET_TYPES.map((widget) => {
                    const Icon = widget.icon;
                    return (
                      <button
                        key={widget.type}
                        onClick={() => handleAddWidget(widget.type)}
                        className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-medium">{widget.label}</h4>
                      </button>
                    );
                  })}
                </div>

                <div className="p-6 border-t border-[var(--border)] flex justify-end">
                  <Button variant="outline" onClick={() => setShowWidgetPicker(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4 max-w-2xl">
          <h3 className="font-medium">Search Engine Optimization</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <Input
              value={page.metaTitle || ''}
              onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
              placeholder={page.title || 'Page title'}
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {(page.metaTitle || page.title || '').length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea
              value={page.metaDescription || ''}
              onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
              placeholder="Brief description for search engines..."
              rows={3}
              className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base transition-all duration-150 placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary-dark)] focus:ring-[3px] focus:ring-[var(--primary-light)] resize-none"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {(page.metaDescription || '').length}/160 characters
            </p>
          </div>

          {/* SEO Preview */}
          <div className="mt-6 p-4 bg-[var(--muted)] rounded-lg">
            <p className="text-xs text-[var(--muted-foreground)] mb-2">Search Preview</p>
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {page.metaTitle || page.title || 'Page Title'}
            </div>
            <div className="text-green-700 text-sm">
              archiesremedies.com/{page.slug || 'page-slug'}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {page.metaDescription || 'Page description will appear here...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
