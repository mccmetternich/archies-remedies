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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
          <h1 className="text-2xl font-medium">Navigation</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage header and footer navigation
          </p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          Save All
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('bumper')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'bumper'
              ? 'border-[var(--foreground)] text-[var(--foreground)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <Megaphone className="w-4 h-4 inline mr-2" />
          Announcement Bar
        </button>
        <button
          onClick={() => setActiveTab('header')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'header'
              ? 'border-[var(--foreground)] text-[var(--foreground)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <Menu className="w-4 h-4 inline mr-2" />
          Header Navigation
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'footer'
              ? 'border-[var(--foreground)] text-[var(--foreground)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          Footer Links
        </button>
      </div>

      {/* Announcement Bar Settings */}
      {activeTab === 'bumper' && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="p-6 border-b border-[var(--border-light)]">
            <h2 className="font-medium text-lg mb-2">Announcement Bar</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[var(--card)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--foreground)]"></div>
              </label>
              <span className="text-sm font-medium">Enable Announcement Bar</span>
            </div>

            {/* Announcement Text */}
            <div>
              <label className="block text-sm font-medium mb-2">Announcement Text</label>
              <Input
                value={bumperSettings.bumperText}
                onChange={(e) => setBumperSettings({ ...bumperSettings, bumperText: e.target.value })}
                placeholder="Free shipping on orders over $50!"
                className="w-full"
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">This text will be centered in the announcement bar</p>
            </div>

            {/* Link URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Link Text (optional)</label>
                <Input
                  value={bumperSettings.bumperLinkText}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperLinkText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Link URL (optional)</label>
                <Input
                  value={bumperSettings.bumperLinkUrl}
                  onChange={(e) => setBumperSettings({ ...bumperSettings, bumperLinkUrl: e.target.value })}
                  placeholder="/products/eye-drops"
                />
              </div>
            </div>

            {/* Preview */}
            {bumperSettings.bumperText && (
              <div>
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div className="bg-[var(--primary)] py-3 px-4 rounded-lg">
                  <div className="flex items-center justify-center gap-3 text-sm text-[var(--foreground)]">
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
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between">
            <h2 className="font-medium">Navigation Items</h2>
            <Button variant="outline" size="sm" onClick={handleAddNav}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <Reorder.Group
            axis="y"
            values={navItems}
            onReorder={handleReorderNav}
            className="divide-y divide-[var(--border-light)]"
          >
            {navItems.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="p-4 flex items-center gap-4 hover:bg-[var(--muted)] transition-colors cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.label || 'Untitled'}</h3>
                    <span className="px-2 py-0.5 text-xs bg-[var(--primary-light)] text-[var(--foreground)] rounded-full">
                      {item.type}
                    </span>
                    {!item.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">{item.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditNav(item)}
                    className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </button>
                  <button
                    onClick={() => handleDeleteNav(item.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {navItems.length === 0 && (
            <div className="py-12 text-center">
              <Menu className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
              <h3 className="font-medium mb-2">No navigation items</h3>
              <Button variant="outline" onClick={handleAddNav}>
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Footer Links */}
      {activeTab === 'footer' && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between">
            <h2 className="font-medium">Footer Links</h2>
            <Button variant="outline" size="sm" onClick={handleAddFooter}>
              <Plus className="w-4 h-4" />
              Add Link
            </Button>
          </div>

          <Reorder.Group
            axis="y"
            values={footerLinks}
            onReorder={handleReorderFooter}
            className="divide-y divide-[var(--border-light)]"
          >
            {footerLinks.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="p-4 flex items-center gap-4 hover:bg-[var(--muted)] transition-colors cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.label || 'Untitled'}</h3>
                    <span className="px-2 py-0.5 text-xs bg-[var(--secondary)] text-[var(--foreground)] rounded-full">
                      {item.column}
                    </span>
                    {!item.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">{item.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditFooter(item)}
                    className="p-2 rounded-lg hover:bg-[var(--border-light)] transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </button>
                  <button
                    onClick={() => handleDeleteFooter(item.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {footerLinks.length === 0 && (
            <div className="py-12 text-center">
              <LinkIcon className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
              <h3 className="font-medium mb-2">No footer links</h3>
              <Button variant="outline" onClick={handleAddFooter}>
                <Plus className="w-4 h-4" />
                Add Link
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCancelEdit} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-medium">
                {editType === 'nav' ? 'Edit Navigation Item' : 'Edit Footer Link'}
              </h2>
              <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editForm as any).isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <Input
                    value={(editForm as any).label || ''}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    placeholder="Products"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <Input
                    value={(editForm as any).url || ''}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    placeholder="/products"
                  />
                </div>
              </div>

              {editType === 'nav' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={(editForm as NavItem).type || 'link'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base"
                    >
                      <option value="link">Link</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="mega">Mega Menu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (for mega menu)</label>
                    <Input
                      value={(editForm as NavItem).description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Browse our products"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL (for mega menu)</label>
                    <Input
                      value={(editForm as NavItem).imageUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {editType === 'footer' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Column</label>
                  <Input
                    value={(editForm as FooterLink).column || ''}
                    onChange={(e) => setEditForm({ ...editForm, column: e.target.value })}
                    placeholder="Shop"
                    list="columns"
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

            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
