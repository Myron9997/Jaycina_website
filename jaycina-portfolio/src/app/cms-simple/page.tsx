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
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    whatsappNumber: 'YOUR_NUMBER_HERE',
    siteTitle: 'Jaycina',
    siteDescription: 'Handmade crochet & wool creations',
    heroTitle: 'Handmade crochet, crafted with patience.',
    heroSubtitle: 'Scarves, beanies, gloves, cosy woolen tees and woven bags — every piece made by hand with care. Bespoke orders welcome.'
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Sample data - in a real setup, this would come from your database
  const sampleProducts: Product[] = [
    {
      id: "p-scarf-01",
      title: "Alpaca Knit Scarf — Ochre",
      category: "Scarves",
      priceInr: "₹2,500",
      priceGbp: "£25",
      short: "Soft alpaca blend, long wrap — hand-stitched finish.",
      materials: ["Alpaca blend", "Hand-dyed", "One size (wrap)"],
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&q=80&auto=format&fit=crop",
      ],
      isActive: true,
    },
    {
      id: "p-beanie-01",
      title: "Chunky Rib Beanie — Cream",
      category: "Beanies",
      priceInr: "₹900",
      priceGbp: "£9",
      short: "Chunky stitch beanie, cozy and timeless.",
      materials: ["Wool blend", "Machine washable"],
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&q=80&auto=format&fit=crop",
      ],
      isActive: true,
    },
    {
      id: "p-glove-01",
      title: "Fingerless Gloves — Maroon",
      category: "Gloves",
      priceInr: "₹600",
      priceGbp: "£6",
      short: "Soft, breathable fingerless gloves ideal for cool mornings.",
      materials: ["Merino wool", "Hand-stitched edge"],
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&q=80&auto=format&fit=crop",
      ],
      isActive: true,
    },
    {
      id: "p-sweater-01",
      title: "Handmade Wool T-Shirt — Unisex",
      category: "Woolen T-Shirts",
      priceInr: "₹4,200",
      priceGbp: "£42",
      short: "Breathable wool t-shirt with a tailored handmade silhouette.",
      materials: ["100% wool", "Custom sizes available"],
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&q=80&auto=format&fit=crop",
      ],
      isActive: true,
    },
    {
      id: "p-bag-01",
      title: "Woven Tote Bag — Natural",
      category: "Bags",
      priceInr: "₹1,800",
      priceGbp: "£18",
      short: "Durable woven tote, ideal for everyday carry.",
      materials: ["Cotton rope", "Reinforced base"],
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&q=80&auto=format&fit=crop",
      ],
      isActive: true,
    },
  ];

  // Sample about sections
  const sampleAboutSections: AboutSection[] = [
    {
      id: 'about-1',
      title: 'About Jaycina',
      content: 'Jaycina is a handcraft artisan focused on traditional crochet techniques and contemporary design. Each piece is created using carefully sourced yarns and handcrafted finishing. She takes commissions for bespoke pieces — from cosy scarves to tailored woolen t-shirts.',
      order: 1
    },
    {
      id: 'about-2',
      title: 'Small batches',
      content: 'Every piece is carefully made in limited quantities to ensure quality.',
      order: 2
    },
    {
      id: 'about-3',
      title: 'Custom orders',
      content: 'Pick yarn, colours and sizes — we\'ll craft it for you.',
      order: 3
    },
    {
      id: 'about-4',
      title: 'Sustainable',
      content: 'We use durable yarns and minimal packaging wherever possible.',
      order: 4
    }
  ];

  React.useEffect(() => {
    setProducts(sampleProducts);
    setAboutSections(sampleAboutSections);
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

    // In a real setup, this would save to your database
    setProducts(prev => [...prev, productData]);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
    
    alert('Product added! (Note: This is a demo - in a real setup, this would save to your database)');
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    alert('Product deleted! (Note: This is a demo - in a real setup, this would update your database)');
  };

  const handleAboutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const aboutData: AboutSection = {
      id: `about-${Date.now()}`,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      order: aboutSections.length + 1
    };

    setAboutSections(prev => [...prev, aboutData]);
    (e.target as HTMLFormElement).reset();
    alert('About section added!');
  };

  const handleAboutDelete = (id: string) => {
    setAboutSections(prev => prev.filter(s => s.id !== id));
    alert('About section deleted!');
  };

  const handleSettingsUpdate = (field: keyof SiteSettings, value: string) => {
    setSiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsSave = () => {
    alert('Settings saved! (Note: This is a demo - in a real setup, this would update your database)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jaycina CMS</h1>
            <p className="text-gray-600 mt-2">Content Management System for your crochet portfolio</p>
          </div>
          <div className="flex gap-4">
            <a 
              href="/" 
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Website
            </a>
            {activeTab === 'products' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showForm ? 'Cancel' : 'Add Product'}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
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
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-sm font-medium mb-2">{product.priceInr} / {product.priceGbp}</p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.short}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
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
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                    <p className="text-gray-700 mb-3">{section.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(section as any)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAboutDelete(section.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
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

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Next Steps</h3>
          <div className="text-blue-800 space-y-2">
            <p>• This is a demo CMS - changes are temporary</p>
            <p>• To make it permanent, set up Supabase backend</p>
            <p>• Add authentication for admin access</p>
            <p>• Connect to real database for persistent storage</p>
          </div>
        </div>
      </div>
    </div>
  );
}


