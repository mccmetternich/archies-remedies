'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  Check,
  ArrowLeft,
  Trash2,
  Plus,
  GripVertical,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { MediaPickerButton } from '@/components/admin/media-picker';
import { cn } from '@/lib/utils';

interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  amazonUrl: string;
  isDefault: boolean | null;
  sortOrder: number;
}

interface ProductBenefit {
  id: string;
  title: string;
  description: string | null;
  isPositive: boolean | null;
  sortOrder: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
  heroImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [benefits, setBenefits] = useState<ProductBenefit[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!isNew) {
      fetchProduct();
    } else {
      setProduct({
        id: '',
        slug: '',
        name: '',
        shortDescription: '',
        longDescription: '',
        price: null,
        compareAtPrice: null,
        heroImageUrl: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [id, isNew]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      setProduct(data.product);
      setVariants(data.variants || []);
      setBenefits(data.benefits || []);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, variants, benefits }),
      });

      const data = await res.json();

      if (isNew && data.id) {
        router.push(`/admin/products/${data.id}`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `new-${Date.now()}`,
        name: '',
        price: null,
        compareAtPrice: null,
        amazonUrl: '',
        isDefault: variants.length === 0,
        sortOrder: variants.length,
      },
    ]);
  };

  const removeVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  const updateVariant = (variantId: string, field: keyof ProductVariant, value: string | number | boolean | null) => {
    setVariants(
      variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const addBenefit = (isPositive: boolean) => {
    setBenefits([
      ...benefits,
      {
        id: `new-${Date.now()}`,
        title: '',
        description: '',
        isPositive,
        sortOrder: benefits.filter((b) => b.isPositive === isPositive).length,
      },
    ]);
  };

  const removeBenefit = (benefitId: string) => {
    setBenefits(benefits.filter((b) => b.id !== benefitId));
  };

  const updateBenefit = (benefitId: string, field: keyof ProductBenefit, value: string | boolean | null) => {
    setBenefits(
      benefits.map((b) => (b.id === benefitId ? { ...b, [field]: value } : b))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--admin-text-muted)]">Product not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'variants', label: 'Variants' },
    { id: 'benefits', label: "What's In/Not" },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg hover:bg-[var(--admin-input)] transition-colors text-[var(--admin-text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium text-[var(--admin-text-primary)]">
              {isNew ? 'New Product' : product.name || 'Edit Product'}
            </h1>
            {!isNew && (
              <p className="text-[var(--admin-text-secondary)] mt-1">
                /products/{product.slug}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={saving}>
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isNew ? 'Create Product' : 'Save Changes'}
              </>
            )}
          </Button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--admin-input)] rounded-xl p-1 border border-[var(--admin-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-[var(--admin-button-text)]'
                : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--admin-input)] rounded-xl border border-[var(--admin-border)] p-6">
        {activeTab === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isActive ?? true}
                  onChange={(e) => setProduct({ ...product, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--admin-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
              <span className="font-medium text-[var(--admin-text-primary)]">Published</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Product Name *</label>
                <Input
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="Dry Eye Relief Drops"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">URL Slug *</label>
                <Input
                  value={product.slug}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                  placeholder="eye-drops"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Short Description</label>
              <textarea
                value={product.shortDescription || ''}
                onChange={(e) => setProduct({ ...product, shortDescription: e.target.value })}
                placeholder="Brief description for product cards..."
                rows={2}
                className="flex w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input)] px-4 py-3 text-base text-[var(--admin-text-primary)] transition-all duration-150 placeholder:text-[var(--admin-text-placeholder)] hover:border-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Full Description</label>
              <RichTextEditor
                value={product.longDescription || ''}
                onChange={(value) => setProduct({ ...product, longDescription: value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={product.price || ''}
                  onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || null })}
                  placeholder="24.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Compare at Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={product.compareAtPrice || ''}
                  onChange={(e) => setProduct({ ...product, compareAtPrice: parseFloat(e.target.value) || null })}
                  placeholder="29.99"
                />
              </div>
            </div>

            <MediaPickerButton
              label="Hero Image"
              value={product.heroImageUrl}
              onChange={(url) => setProduct({ ...product, heroImageUrl: url || null })}
              helpText="Main product image displayed on product page"
              folder="products"
            />
          </motion.div>
        )}

        {activeTab === 'variants' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--admin-text-secondary)]">
                Add variants like &quot;30 Count&quot; or &quot;60 Count&quot; with different Amazon URLs.
              </p>
              <Button variant="outline" onClick={addVariant}>
                <Plus className="w-4 h-4" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-4 border border-[var(--admin-border)] rounded-lg space-y-4 bg-[var(--admin-sidebar)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-[var(--admin-text-muted)] cursor-grab" />
                      <span className="font-medium text-[var(--admin-text-primary)]">Variant {index + 1}</span>
                      {variant.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeVariant(variant.id)}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Name</label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                        placeholder="30 Count"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Amazon URL</label>
                      <Input
                        value={variant.amazonUrl}
                        onChange={(e) => updateVariant(variant.id, 'amazonUrl', e.target.value)}
                        placeholder="https://amazon.com/..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.price || ''}
                        onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || null)}
                        placeholder="24.99"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Compare at ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.compareAtPrice || ''}
                        onChange={(e) => updateVariant(variant.id, 'compareAtPrice', parseFloat(e.target.value) || null)}
                        placeholder="29.99"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.isDefault ?? false}
                          onChange={(e) => {
                            // Make this the default, unset others
                            setVariants(
                              variants.map((v) => ({
                                ...v,
                                isDefault: v.id === variant.id ? e.target.checked : false,
                              }))
                            );
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-[var(--admin-text-secondary)]">Default variant</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {variants.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-[var(--admin-border)] rounded-lg">
                  <p className="text-[var(--admin-text-muted)]">No variants yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'benefits' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* What's In */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-green-400">What&apos;s In</h3>
                <Button variant="outline" size="sm" onClick={() => addBenefit(true)}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {benefits
                  .filter((b) => b.isPositive)
                  .map((benefit) => (
                    <div
                      key={benefit.id}
                      className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          value={benefit.title}
                          onChange={(e) => updateBenefit(benefit.id, 'title', e.target.value)}
                          placeholder="Preservative-Free"
                        />
                        <Input
                          value={benefit.description || ''}
                          onChange={(e) => updateBenefit(benefit.id, 'description', e.target.value)}
                          placeholder="Description (optional)"
                        />
                      </div>
                      <button
                        onClick={() => removeBenefit(benefit.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* What's Not */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-red-400">What&apos;s Not</h3>
                <Button variant="outline" size="sm" onClick={() => addBenefit(false)}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {benefits
                  .filter((b) => !b.isPositive)
                  .map((benefit) => (
                    <div
                      key={benefit.id}
                      className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          value={benefit.title}
                          onChange={(e) => updateBenefit(benefit.id, 'title', e.target.value)}
                          placeholder="No Preservatives"
                        />
                        <Input
                          value={benefit.description || ''}
                          onChange={(e) => updateBenefit(benefit.id, 'description', e.target.value)}
                          placeholder="Description (optional)"
                        />
                      </div>
                      <button
                        onClick={() => removeBenefit(benefit.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'seo' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Meta Title</label>
              <Input
                value={product.metaTitle || ''}
                onChange={(e) => setProduct({ ...product, metaTitle: e.target.value })}
                placeholder={`${product.name} | Archie's Remedies`}
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Leave empty to use default format
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Meta Description</label>
              <textarea
                value={product.metaDescription || ''}
                onChange={(e) => setProduct({ ...product, metaDescription: e.target.value })}
                placeholder="Description for search engines..."
                rows={3}
                className="flex w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input)] px-4 py-3 text-base text-[var(--admin-text-primary)] transition-all duration-150 placeholder:text-[var(--admin-text-placeholder)] hover:border-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
