"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  category: string;
  priceInr: string;
  priceGbp: string;
  short: string;
  description?: string;
  materials: string[];
  images: string[];
  isActive: boolean;
}

interface AboutSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface SiteSettings {
  whatsappNumber: string;
  siteTitle: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  productCategories?: string[];
  logoUrl?: string;
  madeInLocation?: string;
  materialsLine?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export default function CMS() {
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'settings' | 'process'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [processSteps, setProcessSteps] = useState<{ id: string; title: string; description: string; imageUrl: string; order: number }[]>([]);
  const [testimonials, setTestimonials] = useState<Array<{ id: string; content: string; author: string; order: number }>>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    whatsappNumber: 'YOUR_NUMBER_HERE',
    siteTitle: 'Jaycina',
    siteDescription: 'Handmade crochet & wool creations',
    heroTitle: 'Handmade crochet, crafted with patience.',
    heroSubtitle: 'Scarves, beanies, gloves, cosy woolen tees and woven bags — every piece made by hand with care. Bespoke orders welcome.',
    productCategories: [],
    logoUrl: '',
    madeInLocation: 'Goa, India',
    materialsLine: 'Alpaca · Merino · Cotton blends',
    instagramUrl: '',
    facebookUrl: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const imagesInputRef = React.useRef<HTMLInputElement>(null)
  const [savingSettings, setSavingSettings] = React.useState(false)
  const [settingsSaved, setSettingsSaved] = React.useState<null | string>(null)
  const [categorySelection, setCategorySelection] = useState<string>('');
  
  async function signOut() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    window.location.href = '/admin/login'
  }

  // Auth checks disabled while wiring up DB-backed CMS

  React.useEffect(() => {
    // Products
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))

    // About
    fetch('/api/about')
      .then((r) => r.json())
      .then((data) => setAboutSections(Array.isArray(data) ? data : []))
      .catch(() => setAboutSections([]))

    // Process steps
    fetch('/api/process-steps')
      .then((r) => r.json())
      .then((data) => setProcessSteps(Array.isArray(data) ? data : []))
      .catch(() => setProcessSteps([]))

    // Settings
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => { if (data) setSiteSettings(data) })
      .catch(() => {})

    // Testimonials
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => setTestimonials([]))
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const selected = String(formData.get('category') || '')
    const category = selected === '__custom__' ? String(formData.get('categoryCustom') || '') : selected
    
    const productData: Product = {
      id: `p-${Date.now()}`,
      title: formData.get('title') as string,
      category,
      priceInr: formData.get('priceInr') as string,
      priceGbp: formData.get('priceGbp') as string,
      short: formData.get('short') as string,
      description: formData.get('description') as string,
      materials: (formData.get('materials') as string).split(',').map(m => m.trim()),
      images: (formData.get('images') as string).split(',').map(img => img.trim()),
      isActive: true
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to create product');
      return;
    }
    const created = await res.json();
    setProducts((prev) => [created, ...prev]);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to delete');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      title: String(formData.get('title') || ''),
      content: String(formData.get('content') || ''),
      order: aboutSections.length + 1,
    };
    const res = await fetch('/api/about', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to add section');
      return;
    }
    const created = await res.json();
    setAboutSections((prev) => [...prev, created]);
    (e.target as HTMLFormElement).reset();
  };

  const handleAboutDelete = async (id: string) => {
    const res = await fetch(`/api/about/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to delete');
      return;
    }
    setAboutSections(prev => prev.filter(s => s.id !== id));
  };

  const handleSettingsUpdate = (field: keyof SiteSettings, value: string) => {
    setSiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsSave = async () => {
    setSavingSettings(true)
    setSettingsSaved(null)
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteSettings) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to save settings');
        return;
      }
      const saved = await res.json();
      setSiteSettings(saved);
      setSettingsSaved('Settings saved')
      setTimeout(() => setSettingsSaved(null), 2500)
    } finally {
      setSavingSettings(false)
    }
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const base64 = await toBase64WithProgress(file, (p) => setUploadProgress(Math.round(p)))
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, filename: file.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      // Auto-insert URL into Add Product images input (scoped via ref)
      const input = imagesInputRef.current
      if (input) input.value = (input.value ? input.value + ', ' : '') + data.url
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Upload helper for process step imageUrl input
  async function handleProcessImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const base64 = await toBase64WithProgress(file, (p) => setUploadProgress(Math.round(p)))
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, filename: file.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      // Auto-insert URL into Process Step imageUrl input
      const input = (document.getElementsByName('imageUrl')[0] as HTMLInputElement)
      if (input) {
        input.value = data.url
      }
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function toBase64WithProgress(file: File, onProgress: (percent: number) => void) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onprogress = (evt) => {
        if (evt.lengthComputable) {
          onProgress((evt.loaded / evt.total) * 100)
        }
      }
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 sm:px-6 lg:px-8 py-6" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-br from-amber-300 to-rose-300 flex items-center justify-center shadow-sm">
              {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-white">WG</span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">Weave and Glow Magic Dashboard</h1>
              <p className="text-slate-600 mt-1 text-xs sm:text-sm">Minimal, mobile-friendly admin for products, about, process & settings</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {activeTab === 'products' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm shadow-sm hover:opacity-95 active:scale-95 transition"
              >
                <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Product'}</span>
                <span className="sm:hidden">{showForm ? 'Cancel' : 'Add'}</span>
              </button>
            )}
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white text-slate-700 px-3 py-2 text-sm shadow-sm hover:bg-slate-50 active:scale-95 transition">View Site</Link>
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white text-slate-700 px-3 py-2 text-sm shadow-sm hover:bg-slate-50 active:scale-95 transition">Log out</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 -mx-2 px-2">
          <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {([
              { key: 'products', label: `Products (${products.length})` },
              { key: 'about', label: `About Sections (${aboutSections.length})` },
              { key: 'settings', label: 'Site Settings' },
              { key: 'process', label: `Process Steps (${processSteps.length})` },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition border ${
                  activeTab === (t.key as any)
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Alpaca Knit Scarf — Ochre"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <div className="space-y-2">
                    <select
                      name="category"
                      required
                      value={categorySelection}
                      onChange={(e) => setCategorySelection(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {(siteSettings.productCategories || []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__custom__">+ Add new…</option>
                    </select>
                    {categorySelection === '__custom__' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="categoryCustom"
                          placeholder="Enter new category"
                          className="flex-1 block border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          className="px-3 py-2 border rounded text-sm"
                          onClick={async (e) => {
                            const input = (e.currentTarget.previousSibling as HTMLInputElement)
                            const value = (input?.value || '').trim()
                            if (!value) return
                            const next = Array.from(new Set([...(siteSettings.productCategories || []), value]))
                            const payload = { ...siteSettings, productCategories: next }
                            const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}))
                              alert(err.error || 'Failed to save category')
                              return
                            }
                            const saved = await res.json()
                            setSiteSettings(saved)
                            setCategorySelection(value)
                          }}
                        >
                          Save & Use
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
                  <input
                    type="text"
                    name="priceInr"
                    required
                    placeholder="e.g., ₹2,500"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (GBP)</label>
                  <input
                    type="text"
                    name="priceGbp"
                    required
                    placeholder="e.g., £25"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <textarea
                  name="short"
                  required
                  rows={2}
                  placeholder="Brief description for product cards"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Detailed description for product modal"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Materials (comma-separated)</label>
                <input
                  type="text"
                  name="materials"
                  placeholder="e.g., Alpaca blend, Hand-dyed, One size"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
                <div>
                <label className="block text-sm font-medium text-gray-700">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  name="images"
                    ref={imagesInputRef}
                  placeholder="https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-2 flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
                  {uploading && (
                    <div className="text-xs text-gray-600">Uploading… {uploadProgress}%</div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Products ({products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-12 mb-3">
                  {product.images[0] && product.images[0].startsWith('http') ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 text-gray-400 flex items-center justify-center rounded text-sm">No image</div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <p className="text-sm font-medium mb-2">{product.priceInr} / {product.priceGbp}</p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.short}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingProduct(product); setShowEdit(true); }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Add New About Section</h2>
              <form onSubmit={handleAboutSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Our Story"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    name="content"
                    required
                    rows={4}
                    placeholder="Write your about section content here..."
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Section
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Current About Sections ({aboutSections.length})</h2>
              <div className="space-y-4">
                {aboutSections.map((section) => (
                  <AboutItem key={section.id} section={section} onSaved={(updated) => setAboutSections((prev) => prev.map((s) => s.id === updated.id ? updated : s))} onDeleted={() => setAboutSections((prev) => prev.filter((s) => s.id !== section.id))} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Site Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                <input
                  type="text"
                  value={siteSettings.whatsappNumber}
                  onChange={(e) => handleSettingsUpdate('whatsappNumber', e.target.value)}
                  placeholder="e.g., 919999888777 (no + sign)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter your WhatsApp number in international format without + sign</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
                <input
                  type="text"
                  value={siteSettings.siteTitle}
                  onChange={(e) => handleSettingsUpdate('siteTitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                <input
                  type="text"
                  value={siteSettings.siteDescription}
                  onChange={(e) => handleSettingsUpdate('siteDescription', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={siteSettings.heroTitle}
                  onChange={(e) => handleSettingsUpdate('heroTitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <textarea
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => handleSettingsUpdate('heroSubtitle', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Made In Location</label>
                  <input
                    type="text"
                    value={siteSettings.madeInLocation || ''}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, madeInLocation: e.target.value }))}
                    placeholder="e.g., Goa, India"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Materials Line</label>
                  <input
                    type="text"
                    value={siteSettings.materialsLine || ''}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, materialsLine: e.target.value }))}
                    placeholder="e.g., Alpaca · Merino · Cotton blends"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={siteSettings.instagramUrl || ''}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                    placeholder="https://www.instagram.com/weave_and_glow_magic"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={siteSettings.facebookUrl || ''}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, facebookUrl: e.target.value }))}
                    placeholder="https://facebook.com/your-page"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
                <p className="text-xs text-gray-500 mb-2">Manage the list used in the product form dropdown.</p>
                <div className="space-y-2">
                  {(siteSettings.productCategories || []).map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c}
                        onChange={(e) => setSiteSettings((prev) => ({
                          ...prev,
                          productCategories: (prev.productCategories || []).map((pc, i) => i === idx ? e.target.value : pc)
                        }))}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => setSiteSettings((prev) => ({
                          ...prev,
                          productCategories: (prev.productCategories || []).filter((_, i) => i !== idx)
                        }))}
                        className="text-sm px-3 py-2 border rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add new category"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = (e.target as HTMLInputElement).value.trim()
                          if (!value) return
                          setSiteSettings((prev) => ({
                            ...prev,
                            productCategories: [...(prev.productCategories || []), value]
                          }))
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement)
                        const value = input.value.trim()
                        if (!value) return
                        setSiteSettings((prev) => ({
                          ...prev,
                          productCategories: [...(prev.productCategories || []), value]
                        }))
                        input.value = ''
                      }}
                      className="text-sm px-3 py-2 border rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={siteSettings.logoUrl || ''}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(true)
                      setUploadProgress(0)
                      try {
                        const base64 = await toBase64WithProgress(file, (p) => setUploadProgress(Math.round(p)))
                        const res = await fetch('/api/admin/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ fileBase64: base64, filename: file.name }),
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.error || 'Upload failed')
                        setSiteSettings((prev) => ({ ...prev, logoUrl: data.url }))
                      } catch (err: any) {
                        alert(err.message || 'Upload failed')
                      } finally {
                        setUploading(false)
                        setUploadProgress(0)
                      }
                    }}
                  />
                </div>
                {uploading && <div className="text-xs text-gray-600 mt-1">Uploading… {uploadProgress}%</div>}
                {siteSettings.logoUrl && (
                  <div className="mt-3">
                    <img src={siteSettings.logoUrl} alt="Logo preview" className="h-12 w-12 rounded-lg object-cover border" />
                  </div>
                )}
              </div>

              <button
                onClick={handleSettingsSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                disabled={savingSettings}
              >
                {savingSettings ? 'Saving…' : 'Save Settings'}
              </button>
              {settingsSaved && <span className="ml-3 text-sm text-green-700">{settingsSaved}</span>}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Admin Users</h2>
            <AdminUsersPanel />
          </div>
        )}

        {/* Process Tab */}
        {activeTab === 'process' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Step</h2>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.target as HTMLFormElement)
                const payload = {
                  title: String(fd.get('title') || ''),
                  description: String(fd.get('description') || ''),
                  imageUrl: String(fd.get('imageUrl') || ''),
                  order: processSteps.length + 1,
                }
                const res = await fetch('/api/process-steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                if (!res.ok) return alert('Failed to add step')
                const created = await res.json()
                setProcessSteps((prev) => [...prev, created])
                ;(e.target as HTMLFormElement).reset()
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input name="title" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input name="imageUrl" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="https://..." />
                    <div className="mt-2 flex items-center gap-3">
                      <input type="file" accept="image/*" onChange={handleProcessImageUpload} disabled={uploading} />
                      {uploading && (
                        <div className="text-xs text-gray-600">Uploading… {uploadProgress}%</div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" rows={3} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">Add Step</button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Current Steps ({processSteps.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processSteps.sort((a,b)=>a.order-b.order).map((step) => (
                  <ProcessItem key={step.id} step={step} onSaved={(updated) => setProcessSteps((prev) => prev.map((s) => s.id === updated.id ? updated : s))} onDeleted={() => setProcessSteps((prev) => prev.filter((s) => s.id !== step.id))} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Testimonials controls (Settings only) */}
        {activeTab === 'settings' && (
        <div className="space-y-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Testimonial</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.target as HTMLFormElement)
              const payload = {
                content: String(fd.get('content') || ''),
                author: String(fd.get('author') || 'Anonymous'),
                order: testimonials.length + 1,
              }
              const res = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
              if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                alert(err.error || 'Failed to add testimonial')
                return
              }
              const created = await res.json()
              setTestimonials((prev) => [...prev, created])
              ;(e.target as HTMLFormElement).reset()
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea name="content" rows={3} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author (optional)</label>
                <input name="author" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Anonymous" />
              </div>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">Add Testimonial</button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current Testimonials ({testimonials.length})</h2>
            <div className="space-y-3">
              {testimonials.sort((a,b)=>a.order-b.order).map((t) => (
                <div key={t.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-800">{t.content}</div>
                    <div className="text-xs text-gray-500 mt-1">— {t.author || 'Anonymous'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this testimonial?')) return
                        const res = await fetch(`/api/testimonials/${t.id}`, { method: 'DELETE' })
                        const data = await res.json().catch(() => ({}))
                        if (!res.ok) {
                          alert(data.error || 'Failed to delete')
                          return
                        }
                        setTestimonials((prev) => prev.filter((x) => x.id !== t.id))
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && (
                <div className="text-sm text-gray-500">No testimonials yet.</div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* removed demo next steps */}
      </div>
      {showEdit && editingProduct && (
        <EditModal
          product={editingProduct}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
        />
      )}
    </div>
  );
}

// Edit Modal
function EditModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: (p: Product) => void }) {
  const [form, setForm] = React.useState<Product>(product)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      onSaved(data)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const base64 = await toBase64WithProgress(file, (p) => setUploadProgress(Math.round(p)))
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, filename: file.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      // Replace main image (first) with the newly uploaded URL
      setForm((prev) => {
        const current = Array.isArray(prev.images) ? prev.images : []
        if (current.length === 0) return { ...prev, images: [data.url] }
        const next = [data.url, ...current.slice(1)]
        return { ...prev, images: next }
      })
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function toBase64WithProgress(file: File, onProgress: (percent: number) => void) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onprogress = (evt) => {
        if (evt.lengthComputable) onProgress((evt.loaded / evt.total) * 100)
      }
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="p-4 border-b font-semibold">Edit Product</div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" value={form.priceInr} onChange={(e) => setForm({ ...form, priceInr: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (GBP)</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" value={form.priceGbp} onChange={(e) => setForm({ ...form, priceGbp: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short</label>
            <textarea className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" rows={2} value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Materials (comma-separated)</label>
            <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" value={form.materials.join(', ')} onChange={(e) => setForm({ ...form, materials: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Images (comma-separated)</label>
            <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" value={form.images.join(', ')} onChange={(e) => setForm({ ...form, images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            <div className="mt-2 flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
              {uploading && <div className="text-xs text-gray-600">Uploading… {uploadProgress}%</div>}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AdminUsersPanel() {
  const [users, setUsers] = React.useState<Array<{ id: string; email: string; created_at?: string; createdAt?: string }>>([])
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState<{ email: string; password: string }>({ email: '', password: '' })

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      alert(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { refresh() }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password) return alert('Email and password required')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create user')
      setForm({ email: '', password: '' })
      await refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this admin user?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to delete user')
      await refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="email"
          placeholder="admin@example.com"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <button type="submit" disabled={loading} className="bg-slate-900 text-white rounded-md px-4 py-2 disabled:opacity-50">
          {loading ? 'Saving…' : 'Add Admin'}
        </button>
      </form>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2 border-b">Email</th>
              <th className="text-left px-3 py-2 border-b">Created</th>
              <th className="text-right px-3 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{new Date(u.createdAt || (u as any).created_at || Date.now()).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => deleteUser(u.id)} disabled={loading} className="text-red-600 hover:underline disabled:opacity-50">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={3}>No admin users yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AboutItem({ section, onSaved, onDeleted }: { section: AboutSection; onSaved: (s: AboutSection) => void; onDeleted: () => void }) {
	const [editing, setEditing] = React.useState(false)
	const [form, setForm] = React.useState<AboutSection>(section)
	const [saving, setSaving] = React.useState(false)

	async function save() {
		setSaving(true)
		try {
			const res = await fetch(`/api/about/${section.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, content: form.content, order: form.order }) })
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to save')
			onSaved(data)
			setEditing(false)
		} catch (err: any) {
			alert(err.message || 'Failed to save')
		} finally {
			setSaving(false)
		}
	}

	async function del() {
		const res = await fetch(`/api/about/${section.id}`, { method: 'DELETE' })
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			alert(err.error || 'Failed to delete')
			return
		}
		onDeleted()
	}

	return (
		<div className="border border-gray-200 rounded-lg p-4">
			{editing ? (
				<div className="space-y-3">
					<input className="w-full border rounded px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
					<textarea className="w-full border rounded px-3 py-2" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
					<div className="flex items-center gap-2">
						<button onClick={save} disabled={saving} className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
						<button onClick={() => setEditing(false)} className="border px-3 py-1 rounded text-sm">Cancel</button>
					</div>
				</div>
			) : (
				<>
					<h3 className="font-semibold text-lg mb-2">{section.title}</h3>
					<p className="text-gray-700 mb-3">{section.content}</p>
					<div className="flex gap-2">
						<button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">Edit</button>
						<button onClick={del} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">Delete</button>
					</div>
				</>
			)}
		</div>
	)
}

function ProcessItem({ step, onSaved, onDeleted }: { step: { id: string; title: string; description: string; imageUrl: string; order: number }; onSaved: (s: any) => void; onDeleted: () => void }) {
	const [editing, setEditing] = React.useState(false)
	const [form, setForm] = React.useState(step)
	const [saving, setSaving] = React.useState(false)

	async function save() {
		setSaving(true)
		try {
			const res = await fetch(`/api/process-steps/${step.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to save')
			onSaved(data)
			setEditing(false)
		} catch (err: any) {
			alert(err.message || 'Failed to save')
		} finally {
			setSaving(false)
		}
	}

	async function del() {
		const res = await fetch(`/api/process-steps/${step.id}`, { method: 'DELETE' })
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			alert(err.error || 'Failed to delete')
			return
		}
		onDeleted()
	}

	return (
		<div className="border border-gray-200 rounded-lg p-4">
			{editing ? (
				<div className="space-y-3">
					<input className="w-full border rounded px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
					<input className="w-full border rounded px-3 py-2" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
					<textarea className="w-full border rounded px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
					<input className="w-full border rounded px-3 py-2" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
					<div className="flex items-center gap-2">
						<button onClick={save} disabled={saving} className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
						<button onClick={() => setEditing(false)} className="border px-3 py-1 rounded text-sm">Cancel</button>
					</div>
				</div>
			) : (
				<>
					{step.imageUrl && step.imageUrl.startsWith('http') ? (
						<img src={step.imageUrl} alt={step.title} className="w-full h-32 object-cover rounded mb-3" />
					) : (
						<div className="w-full h-32 bg-gray-100 text-gray-400 flex items-center justify-center rounded text-sm mb-3">No image</div>
					)}
					<h3 className="font-semibold text-lg mb-1">{step.title}</h3>
					<p className="text-gray-700 mb-3">{step.description}</p>
					<div className="text-xs text-gray-500 mb-3">Order: {step.order}</div>
					<div className="flex gap-2">
						<button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">Edit</button>
						<button onClick={del} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">Delete</button>
					</div>
				</>
			)}
		</div>
	)
}
