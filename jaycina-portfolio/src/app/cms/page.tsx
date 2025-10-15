"use client";

import React, { useState } from 'react';

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
}

export default function CMS() {
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'settings' | 'process'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [processSteps, setProcessSteps] = useState<{ id: string; title: string; description: string; imageUrl: string; order: number }[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    whatsappNumber: 'YOUR_NUMBER_HERE',
    siteTitle: 'Jaycina',
    siteDescription: 'Handmade crochet & wool creations',
    heroTitle: 'Handmade crochet, crafted with patience.',
    heroSubtitle: 'Scarves, beanies, gloves, cosy woolen tees and woven bags — every piece made by hand with care. Bespoke orders welcome.'
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const productData: Product = {
      id: `p-${Date.now()}`,
      title: formData.get('title') as string,
      category: formData.get('category') as string,
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
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteSettings) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to save settings');
      return;
    }
    const saved = await res.json();
    setSiteSettings(saved);
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
      // Auto-insert URL into Images input
      const input = (document.getElementsByName('images')[0] as HTMLInputElement)
      if (input) {
        input.value = (input.value ? input.value + ', ' : '') + data.url
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Jaycina CMS</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm">Manage products, about, process and settings</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <a 
              href="/" 
              className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              View Website
            </a>
            {activeTab === 'products' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {showForm ? 'Cancel' : 'Add Product'}
              </button>
            )}
            <button
              onClick={signOut}
              className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 -mx-4 px-4">
          <nav className="flex gap-6 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              About Sections ({aboutSections.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Site Settings
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'process'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Process Steps ({processSteps.length})
            </button>
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
                  <select
                    name="category"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Scarves">Scarves</option>
                    <option value="Beanies">Beanies</option>
                    <option value="Gloves">Gloves</option>
                    <option value="Woolen T-Shirts">Woolen T-Shirts</option>
                    <option value="Bags">Bags</option>
                  </select>
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

              <button
                onClick={handleSettingsSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
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
      // auto-append URL to images
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), data.url] }))
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
