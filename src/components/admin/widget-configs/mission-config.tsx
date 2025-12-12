'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Target,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerButton } from '@/components/admin/media-picker';

interface MissionValue {
  id: string;
  number: string;
  title: string;
  description: string;
}

interface MissionConfig {
  title: string;
  subtitle: string | null;
  description: string;
  imageUrl: string | null;
  statNumber: string | null;
  statLabel: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  values: MissionValue[];
}

interface MissionConfigProps {
  config: MissionConfig;
  onConfigChange: (config: MissionConfig) => void;
}

/**
 * Mission Section configuration panel.
 * Allows editing the mission section title, description, image, stats, and values.
 */
export function MissionSectionConfig({
  config,
  onConfigChange,
}: MissionConfigProps) {
  const [expandedValue, setExpandedValue] = useState<string | null>(null);

  const updateConfig = (updates: Partial<MissionConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const addValue = () => {
    const nextNumber = String(config.values.length + 1).padStart(2, '0');
    const newValue: MissionValue = {
      id: `value-${Date.now()}`,
      number: nextNumber,
      title: 'New Value',
      description: '',
    };
    updateConfig({ values: [...config.values, newValue] });
    setExpandedValue(newValue.id);
  };

  const updateValue = (id: string, updates: Partial<MissionValue>) => {
    const updatedValues = config.values.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    updateConfig({ values: updatedValues });
  };

  const deleteValue = (id: string) => {
    const filtered = config.values.filter((v) => v.id !== id);
    // Re-number remaining values
    const renumbered = filtered.map((v, index) => ({
      ...v,
      number: String(index + 1).padStart(2, '0'),
    }));
    updateConfig({ values: renumbered });
    if (expandedValue === id) {
      setExpandedValue(null);
    }
  };

  const reorderValues = (newOrder: MissionValue[]) => {
    // Re-number after reorder
    const renumbered = newOrder.map((v, index) => ({
      ...v,
      number: String(index + 1).padStart(2, '0'),
    }));
    updateConfig({ values: renumbered });
  };

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <section className="space-y-4">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
          <Target className="w-4 h-4" />
          Main Content
        </h4>

        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Section Title</label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="Why We Exist"
            className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Subtitle (optional)</label>
          <input
            type="text"
            value={config.subtitle || ''}
            onChange={(e) => updateConfig({ subtitle: e.target.value || null })}
            placeholder="Our Mission"
            className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Description</label>
          <textarea
            value={config.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
            placeholder="After the alarming eye drop recalls..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
          />
        </div>
      </section>

      {/* Image & Stats */}
      <section className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)] flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Image & Statistics
        </h4>

        <div>
          <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Section Image</label>
          <MediaPickerButton
            value={config.imageUrl}
            onChange={(url) => updateConfig({ imageUrl: url || null })}
            label="Upload Image"
            helpText="Recommended aspect ratio 3:4"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Stat Number</label>
            <input
              type="text"
              value={config.statNumber || ''}
              onChange={(e) => updateConfig({ statNumber: e.target.value || null })}
              placeholder="2,500+"
              className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Stat Label</label>
            <input
              type="text"
              value={config.statLabel || ''}
              onChange={(e) => updateConfig({ statLabel: e.target.value || null })}
              placeholder="customers who switched"
              className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--admin-text-muted)] mb-1">CTA Text</label>
            <input
              type="text"
              value={config.ctaText || ''}
              onChange={(e) => updateConfig({ ctaText: e.target.value || null })}
              placeholder="Read Our Story"
              className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--admin-text-muted)] mb-1">CTA URL</label>
            <input
              type="text"
              value={config.ctaUrl || ''}
              onChange={(e) => updateConfig({ ctaUrl: e.target.value || null })}
              placeholder="/our-story"
              className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="space-y-4 pt-4 border-t border-[var(--admin-border)]">
        <h4 className="text-sm font-medium text-[var(--admin-text-primary)]">
          Values ({config.values.length})
        </h4>

        <Reorder.Group axis="y" values={config.values} onReorder={reorderValues} className="space-y-2">
          {config.values.map((value) => {
            const isExpanded = expandedValue === value.id;

            return (
              <Reorder.Item key={value.id} value={value} className="list-none">
                <ValueCard
                  value={value}
                  isExpanded={isExpanded}
                  onToggleExpand={() => setExpandedValue(isExpanded ? null : value.id)}
                  onUpdate={(updates) => updateValue(value.id, updates)}
                  onDelete={() => deleteValue(value.id)}
                />
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {config.values.length < 6 && (
          <button
            type="button"
            onClick={addValue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--admin-text-muted)] hover:text-[var(--primary)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Value</span>
          </button>
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────
// Value Card Component
// ─────────────────────────────────────────

interface ValueCardProps {
  value: MissionValue;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<MissionValue>) => void;
  onDelete: () => void;
}

function ValueCard({
  value,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
}: ValueCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      className={cn(
        'bg-[var(--admin-input)] border rounded-lg overflow-hidden transition-all',
        isExpanded ? 'border-[var(--primary)]' : 'border-[var(--admin-border)]'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[var(--admin-hover)] transition-colors"
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)]">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Number */}
        <span className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-medium text-[var(--primary)]">
          {value.number}
        </span>

        {/* Title */}
        <span className="flex-1 font-medium text-sm text-[var(--admin-text-primary)] truncate">
          {value.title || 'Untitled'}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
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
              'p-1 rounded-lg transition-colors',
              showDeleteConfirm
                ? 'text-white bg-red-500'
                : 'text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50'
            )}
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <div className="p-1 text-[var(--admin-text-muted)]">
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
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-3 space-y-3 bg-[var(--admin-bg)] border-t border-[var(--admin-border)]">
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Title</label>
                <input
                  type="text"
                  value={value.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Preservative-Free"
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">Description</label>
                <textarea
                  value={value.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Single-use vials eliminate the need..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
