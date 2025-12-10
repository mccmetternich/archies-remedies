'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  Loader2,
  GripVertical,
  Edit,
  Trash2,
  Save,
  X,
  Menu,
  Link as LinkIcon,
  ChevronDown,
  Megaphone,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  url: string;
  type: string;
  parentId: string | null;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
  column: string;
  isActive: boolean | null;
  sortOrder: number | null;
}

interface BumperSettings {
  bumperEnabled: boolean;
  bumperText: string;
  bumperLinkUrl: string;
  bumperLinkText: string;
}

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState<'bumper' | 'header' | 'footer'>('bumper');
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [bumperSettings, setBumperSettings] = useState<BumperSettings>({
    bumperEnabled: false,
    bumperText: '',
    bumperLinkUrl: '',
    bumperLinkText: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NavItem | FooterLink>>({});
  const [editType, setEditType] = useState<'nav' | 'footer'>('nav');

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      setNavItems(data.navigation || []);
      setFooterLinks(data.footer || []);
      if (data.bumper) {
        setBumperSettings({
          bumperEnabled: data.bumper.bumperEnabled ?? false,
          bumperText: data.bumper.bumperText ?? '',
          bumperLinkUrl: data.bumper.bumperLinkUrl ?? '',
          bumperLinkText: data.bumper.bumperLinkText ?? '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navigation: navItems,
          footer: footerLinks,
          bumper: bumperSettings,
        }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNav = () => {
    const newItem: NavItem = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      type: 'link',
      parentId: null,
      imageUrl: null,
      description: null,
      isActive: true,
      sortOrder: navItems.length,
    };
    setNavItems([...navItems, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
    setEditType('nav');
  };

  const handleAddFooter = () => {
    const newItem: FooterLink = {
      id: `new-${Date.now()}`,
      label: '',
      url: '',
      column: 'Shop',
      isActive: true,
      sortOrder: footerLinks.length,
    };
    setFooterLinks([...footerLinks, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
    setEditType('footer');
  };

  const handleEditNav = (item: NavItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setEditType('nav');
  };

  const handleEditFooter = (item: FooterLink) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setEditType('footer');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editType === 'nav') {
      setNavItems(navItems.map((n) => (n.id === editingId ? { ...n, ...editForm } as NavItem : n)));
    } else {
      setFooterLinks(footerLinks.map((f) => (f.id === editingId ? { ...f, ...editForm } as FooterLink : f)));
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteNav = (id: string) => {
    if (confirm('Delete this navigation item?')) {
      setNavItems(navItems.filter((n) => n.id !== id));
    }
  };

  const handleDeleteFooter = (id: string) => {
    if (confirm('Delete this footer link?')) {
      setFooterLinks(footerLinks.filter((f) => f.id !== id));
    }
  };

  const handleReorderNav = (newOrder: NavItem[]) => {
    setNavItems(newOrder.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const handleReorderFooter = (newOrder: FooterLink[]) => {
    setFooterLinks(newOrder.map((item, index) => ({ ...item, sortOrder: index })));
  };

  // Group footer links by column
  const footerColumns = [...new Set(footerLinks.map((f) => f.column))];

  const [saved, setSaved] = useState(false);

  const handleSaveWithFeedback = async () => {
    await handleSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">Navigation</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">
            Manage header navigation, announcement bar, and footer links
          </p>
        </div>
        <button
          onClick={handleSaveWithFeedback}
          disabled={saving}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
            saved
              ? 'bg-green-500 text-[var(--admin-text-primary)]'
              : 'bg-[var(--primary)] text-[var(--admin-button-text)] hover:bg-[var(--primary-dark)]',
            saving && 'opacity-50 cursor-not-allowed'
          )}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--admin-input)] rounded-xl p-1 border border-[var(--admin-border)]">
        <button
          onClick={() => setActiveTab('bumper')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'bumper'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Megaphone className="w-4 h-4" />
          Announcement Bar
        </button>
        <button
          onClick={() => setActiveTab('header')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'header'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <Menu className="w-4 h-4" />
          Header Navigation
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            activeTab === 'footer'
              ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
              : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
          )}
        >
          <LinkIcon className="w-4 h-4" />
          Footer Links
        </button>
      </div>

      {/* Announcement Bar Settings */}
      {activeTab === 'bumper' && (
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-6 border-b border-[var(--admin-border)]">
            <h2 className="font-medium text-lg text-[var(--admin-text-primary)] mb-2">Announcement Bar</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Display a promotional message at the top of all pages
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bumperSettings.bumperEnabled}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
              <span className="text-sm font-medium text-[var(--admin-text-primary)]">Enable Announcement Bar</span>
            </div>

            {/* Announcement Text */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Announcement Text</label>
              <input
                value={bumperSettings.bumperText}
                onChange={(e) => setBumperSettings({ ...bumperSettings, bumperText: e.target.value })}
                placeholder="Free shipping on orders over $50!"
                className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">This text will be centered in the announcement bar</p>
            </div>

            {/* Link URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Link Text (optional)</label>
                <input
                  value={bumperSettings.bumperLinkText}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperLinkText: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Link URL (optional)</label>
                <input
                  value={bumperSettings.bumperLinkUrl}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperLinkUrl: e.target.value })}
                  placeholder="/products/eye-drops"
                  className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            {/* Preview */}
            {bumperSettings.bumperText && (
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Preview</label>
                <div className="bg-[var(--primary)] py-3 px-4 rounded-lg">
                  <div className="flex items-center justify-center gap-3 text-sm text-[var(--admin-button-text)]">
                    <span className="text-center font-medium">{bumperSettings.bumperText}</span>
                    {bumperSettings.bumperLinkUrl && bumperSettings.bumperLinkText && (
                      <span className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2">
                        {bumperSettings.bumperLinkText}
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Navigation */}
      {activeTab === 'header' && (
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
            <h2 className="font-medium text-[var(--admin-text-primary)]">Navigation Items</h2>
            <button
              onClick={handleAddNav}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          <Reorder.Group
            axis="y"
            values={navItems}
            onReorder={handleReorderNav}
            className="divide-y divide-[var(--admin-border)]"
          >
            {navItems.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="p-4 flex items-center gap-4 hover:bg-[var(--admin-input)] transition-colors cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--admin-text-primary)]">{item.label || 'Untitled'}</h3>
                    <span className="px-2 py-0.5 text-xs bg-[var(--primary)]/20 text-[var(--primary)] rounded-full">
                      {item.type}
                    </span>
                    {!item.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-gray-700 text-[var(--admin-text-secondary)] rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--admin-text-muted)]">{item.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditNav(item)}
                    className="p-2 rounded-lg hover:bg-[var(--admin-hover)] transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[var(--admin-text-secondary)]" />
                  </button>
                  <button
                    onClick={() => handleDeleteNav(item.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {navItems.length === 0 && (
            <div className="py-12 text-center">
              <Menu className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
              <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No navigation items</h3>
              <button
                onClick={handleAddNav}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Links */}
      {activeTab === 'footer' && (
        <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)]">
          <div className="p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
            <h2 className="font-medium text-[var(--admin-text-primary)]">Footer Links</h2>
            <button
              onClick={handleAddFooter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Link
            </button>
          </div>

          <Reorder.Group
            axis="y"
            values={footerLinks}
            onReorder={handleReorderFooter}
            className="divide-y divide-[var(--admin-border)]"
          >
            {footerLinks.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="p-4 flex items-center gap-4 hover:bg-[var(--admin-input)] transition-colors cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--admin-text-primary)]">{item.label || 'Untitled'}</h3>
                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                      {item.column}
                    </span>
                    {!item.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-gray-700 text-[var(--admin-text-secondary)] rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--admin-text-muted)]">{item.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditFooter(item)}
                    className="p-2 rounded-lg hover:bg-[var(--admin-hover)] transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[var(--admin-text-secondary)]" />
                  </button>
                  <button
                    onClick={() => handleDeleteFooter(item.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {footerLinks.length === 0 && (
            <div className="py-12 text-center">
              <LinkIcon className="w-12 h-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
              <h3 className="font-medium text-[var(--admin-text-primary)] mb-2">No footer links</h3>
              <button
                onClick={handleAddFooter}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-input)] text-[var(--admin-text-secondary)] rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelEdit} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--admin-input)] rounded-2xl border border-[var(--admin-border)] shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between">
              <h2 className="text-xl font-medium text-[var(--admin-text-primary)]">
                {editType === 'nav' ? 'Edit Navigation Item' : 'Edit Footer Link'}
              </h2>
              <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--admin-input)] text-[var(--admin-text-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editForm as any).isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
                <span className="text-sm font-medium text-[var(--admin-text-primary)]">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Label</label>
                  <input
                    value={(editForm as any).label || ''}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    placeholder="Products"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">URL</label>
                  <input
                    value={(editForm as any).url || ''}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    placeholder="/products"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              {editType === 'nav' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Type</label>
                    <select
                      value={(editForm as NavItem).type || 'link'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      <option value="link">Link</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="mega">Mega Menu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Description (for mega menu)</label>
                    <input
                      value={(editForm as NavItem).description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Browse our products"
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Image URL (for mega menu)</label>
                    <input
                      value={(editForm as NavItem).imageUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </>
              )}

              {editType === 'footer' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Column</label>
                  <input
                    value={(editForm as FooterLink).column || ''}
                    onChange={(e) => setEditForm({ ...editForm, column: e.target.value })}
                    placeholder="Shop"
                    list="columns"
                    className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <datalist id="columns">
                    <option value="Shop" />
                    <option value="Support" />
                    <option value="Company" />
                    <option value="Legal" />
                  </datalist>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[var(--primary)] text-[var(--admin-button-text)] rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
