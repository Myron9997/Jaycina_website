"use client";

import React, { useState } from "react";
import { useProducts } from "../hooks/useProducts";

type Product = {
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
};

const WHATSAPP_NUMBER = "YOUR_NUMBER_HERE"; // e.g. 919999888777 (replace)

export default function Home(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [siteSettings, setSiteSettings] = useState<{ siteTitle?: string; siteDescription?: string; heroTitle?: string; heroSubtitle?: string; whatsappNumber?: string }>({});
  const [aboutSections, setAboutSections] = useState<{ id: string; title: string; content: string; order: number }[]>([]);
  const [processSteps, setProcessSteps] = useState<{ id: string; title: string; description: string; imageUrl: string; order: number }[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});

  const { products, loading, error } = useProducts();

  React.useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSiteSettings(data || {}))
      .catch(() => {})
    fetch('/api/about')
      .then((r) => r.json())
      .then((data) => setAboutSections(Array.isArray(data) ? data : []))
      .catch(() => setAboutSections([]))
    fetch('/api/process-steps')
      .then((r) => r.json())
      .then((data) => setProcessSteps(Array.isArray(data) ? data : []))
      .catch(() => setProcessSteps([]))
  }, [])

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);

  function openWhatsApp(product?: Product) {
    const text = product
      ? encodeURIComponent(`Hello Jaycina, I'm interested in the ${product.title} (${product.id}). Could you share size & price details?`) 
      : encodeURIComponent("Hello Jaycina, I'm interested in your crochet products. Could you share details on availability and prices?");
    const number = siteSettings.whatsappNumber || WHATSAPP_NUMBER;
    const url = `https://wa.me/${number}?text=${text}`;
    window.open(url, "_blank");
  }

  const handleImageLoad = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageError = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
  };

  // Fallback image for any broken images
  const fallbackImage = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&q=80&auto=format&fit=crop";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A9744B] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading products: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] antialiased">
      {/* Mobile-optimized Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#E8D7C0] to-[#CFA57A] flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm">J</div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl md:text-3xl">{siteSettings.siteTitle || 'Jaycina'}</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">{siteSettings.siteDescription || 'Handmade crochet & wool creations'}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#collection" className="text-sm hover:underline transition-colors">Collection</a>
              <a href="#about" className="text-sm hover:underline transition-colors">About</a>
              <a href="#howto" className="text-sm hover:underline transition-colors">How to Order</a>
              <button 
                onClick={() => openWhatsApp()} 
                className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-transparent bg-[#A9744B] text-white text-sm shadow-sm hover:opacity-95 transition-opacity active:scale-95"
              >
                WhatsApp
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <button 
                onClick={() => openWhatsApp()} 
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-[#A9744B] text-white text-xs sm:text-sm active:scale-95 transition-transform"
              >
                WhatsApp
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-slate-200">
              <nav className="flex flex-col gap-4">
                <a 
                  href="#collection" 
                  className="text-sm py-2 hover:underline transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Collection
                </a>
                <a 
                  href="#about" 
                  className="text-sm py-2 hover:underline transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
          </a>
          <a
                  href="#howto" 
                  className="text-sm py-2 hover:underline transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How to Order
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Mobile-optimized Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 sm:py-14">
          <div className="order-2 lg:order-1">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-6xl leading-tight">
              {siteSettings.heroTitle || 'Handmade crochet, crafted with patience.'}
            </h2>
            <p className="mt-4 sm:mt-6 text-slate-700 text-sm sm:text-base max-w-xl">
              {siteSettings.heroSubtitle || 'Scarves, beanies, gloves, cosy woolen tees and woven bags — every piece made by hand with care. Bespoke orders welcome.'}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a 
                href="#collection" 
                className="btn-secondary text-center"
              >
                Browse Collection
              </a>
              <button 
                onClick={() => openWhatsApp()} 
                className="btn-primary"
              >
                Order via WhatsApp
              </button>
            </div>

            <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-6 text-sm text-slate-600">
              <div>
                <div className="font-semibold">Made in</div>
                <div className="text-xs sm:text-sm">Goa, India</div>
              </div>
              <div>
                <div className="font-semibold">Materials</div>
                <div className="text-xs sm:text-sm">Alpaca · Merino · Cotton blends</div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={products[0]?.images[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&q=80&auto=format&fit=crop"} 
              alt="Hero product" 
              className="w-full h-64 sm:h-80 lg:h-96 object-cover" 
            />
          </div>
        </section>

        {/* Mobile-optimized About Section */}
        <section id="about" className="py-8 sm:py-12 border-t border-slate-100">
          <div className="max-w-4xl">
            <h3 className="font-serif text-xl sm:text-2xl">About {siteSettings.siteTitle || 'Jaycina'}</h3>
            {aboutSections.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aboutSections
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((s) => (
                    <div key={s.id} className="p-4 bg-[#F3EEE9] rounded-lg">
                      <div className="font-semibold text-sm sm:text-base">{s.title}</div>
                      <div className="text-xs sm:text-sm mt-2 text-slate-600">{s.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-700 text-sm sm:text-base">More about us coming soon.</p>
            )}
          </div>
        </section>

        {/* Mobile-optimized Collection */}
        <section id="collection" className="py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="font-serif text-xl sm:text-2xl">Signature Collection</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`text-xs sm:text-sm px-3 py-1 rounded-full whitespace-nowrap transition-colors ${selectedCategory === c ? "bg-[#A9744B] text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((p) => (
              <article key={p.id} className="rounded-xl overflow-hidden bg-white shadow-sm card-hover">
                <div className="h-48 sm:h-56 overflow-hidden">
                  {(() => {
                    const images = Array.isArray(p.images) ? p.images : []
                    const candidate = images.find((s) => typeof s === 'string' && (/^https?:\/\//i.test(s) || /https?:\/\//i.test(s)))
                    const url = candidate ? (candidate.match(/https?:\/\/\S+/i)?.[0] ?? candidate) : undefined
                    return url ? (
                      <img
                        src={url}
                        alt={p.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = ''
                          ;(e.currentTarget.parentElement as HTMLElement).innerHTML = '<div class="w-full h-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm">No image</div>'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm">No image</div>
                    )
                  })()}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base truncate">{p.title}</h4>
                      <div className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">{p.short}</div>
                    </div>
                    <div className="text-sm sm:text-base text-slate-700 font-medium ml-2">{p.priceInr} / {p.priceGbp}</div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                      onClick={() => setModalProduct(p)} 
                      className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-colors active:scale-95"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => openWhatsApp(p)} 
                      className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-full bg-[#A9744B] text-white hover:opacity-95 transition-opacity active:scale-95"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Process (from DB) */}
        <section id="process" className="py-8 sm:py-12 border-t border-slate-100">
          <h3 className="font-serif text-xl sm:text-2xl mb-6">From yarn to finish</h3>
          {processSteps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {processSteps.sort((a,b)=>a.order-b.order).map((s) => (
                <div key={s.id} className="rounded-lg overflow-hidden bg-white shadow-sm p-4 flex flex-col items-center gap-4">
                  {s.imageUrl && s.imageUrl.startsWith('http') ? (
                    <img src={s.imageUrl} alt={s.title} className="w-full h-32 sm:h-40 object-cover rounded" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 text-gray-400 flex items-center justify-center rounded text-sm">No image</div>
                  )}
                  <div className="font-semibold text-sm sm:text-base">{s.title}</div>
                  <div className="text-xs sm:text-sm text-slate-600 text-center">{s.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">Process steps coming soon.</p>
          )}
        </section>

        {/* Mobile-optimized How to Order */}
        <section id="howto" className="py-8 sm:py-12 border-t border-slate-100">
          <h3 className="font-serif text-xl sm:text-2xl mb-4">How to order</h3>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 max-w-3xl text-sm sm:text-base">
            <li>Browse the collection and pick a product you like (or message about a custom order).</li>
            <li>Click <strong>Order</strong> to start a WhatsApp chat. Share size, colour and shipping details.</li>
            <li>We will confirm availability, price and shipping. Pay via bank transfer or cash on delivery (local).</li>
            <li>Receive your handcrafted piece — we take care of careful packaging and timely delivery.</li>
          </ol>

          <div className="mt-6">
            <button 
              onClick={() => openWhatsApp()} 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#A9744B] text-white text-sm sm:text-base hover:opacity-95 transition-opacity active:scale-95"
            >
              Message on WhatsApp
            </button>
          </div>
        </section>

        {/* Mobile-optimized Testimonials */}
        <section className="py-8 sm:py-12">
          <h3 className="font-serif text-xl sm:text-2xl mb-6">What people say</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="text-slate-700 text-sm sm:text-base">&quot;The scarf I ordered is even softer than I imagined — perfect colour and finish. Shipping was quick!&quot;</div>
              <div className="mt-4 font-semibold text-sm sm:text-base">— Anjali</div>
            </div>
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="text-slate-700 text-sm sm:text-base">&quot;Incredible attention to detail. I ordered a custom beanie and the fit was perfect.&quot;</div>
              <div className="mt-4 font-semibold text-sm sm:text-base">— Rohit</div>
            </div>
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="text-slate-700 text-sm sm:text-base">&quot;Beautiful packaging and thoughtful note. Handmade with love.&quot;</div>
              <div className="mt-4 font-semibold text-sm sm:text-base">— Meera</div>
            </div>
          </div>
        </section>

        {/* Mobile-optimized Footer */}
        <footer className="py-8 sm:py-12 border-t border-slate-100">
          <div className="flex flex-col gap-6 text-center sm:text-left">
            <div>
              <div className="font-serif text-lg sm:text-xl">{siteSettings.siteTitle || 'Jaycina'}</div>
              <div className="text-sm text-slate-600">Handmade crochet & woolwear — Goa</div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
              <a href="#about" className="text-sm hover:underline transition-colors">About</a>
              <a href="#collection" className="text-sm hover:underline transition-colors">Collection</a>
              <a href="#howto" className="text-sm hover:underline transition-colors">Order</a>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4">
              <a
                href={`https://wa.me/${siteSettings.whatsappNumber || WHATSAPP_NUMBER}`}
                aria-label="WhatsApp"
                className="p-2 rounded-full border hover:bg-slate-100 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.051 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                </svg>
        </a>
        <a
                href="https://instagram.com/"
                aria-label="Instagram"
                className="p-2 rounded-full border hover:bg-slate-100 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-.75a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z"/>
                </svg>
        </a>
        <a
                href="https://facebook.com/"
                aria-label="Facebook"
                className="p-2 rounded-full border hover:bg-slate-100 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.073C22 6.477 17.523 2 11.927 2 6.332 2 1.855 6.477 1.855 12.073c0 4.997 3.657 9.139 8.438 9.927v-7.023H7.898v-2.904h2.395V9.845c0-2.368 1.41-3.678 3.566-3.678 1.034 0 2.116.185 2.116.185v2.33h-1.192c-1.176 0-1.543.73-1.543 1.48v1.777h2.625l-.42 2.904h-2.205V22c4.78-.788 8.438-4.93 8.438-9.927z"/>
                </svg>
              </a>
            </div>

            <div className="text-sm text-slate-500">© {new Date().getFullYear()} {siteSettings.siteTitle || 'Jaycina'}. All rights reserved.</div>
          </div>
      </footer>
      </main>

      {/* Enhanced Mobile-optimized Modal */}
      {modalProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white rounded-t-xl">
              <h3 className="font-serif text-lg sm:text-xl font-semibold truncate pr-4">{modalProduct.title}</h3>
              <button 
                onClick={() => setModalProduct(null)} 
                className="p-2 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto modal-scroll">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Images Section */}
                <div className="p-4 lg:p-6 bg-slate-50">
                  <div className="space-y-4">
                    <img 
                      src={modalProduct.images[0]} 
                      alt={modalProduct.title} 
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-sm" 
                    />
                    {modalProduct.images.slice(1).map((src, i) => (
                      <img 
                        key={i} 
                        src={src} 
                        alt={`${modalProduct.title}-${i + 1}`} 
                        className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm" 
                      />
                    ))}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 lg:p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xl sm:text-2xl font-semibold">{modalProduct.title}</h4>
                      <div className="text-slate-600 mt-2 text-sm sm:text-base">{modalProduct.short}</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#A9744B] ml-4">{modalProduct.priceInr} / {modalProduct.priceGbp}</div>
                  </div>

                  <div className="mt-4 text-slate-700 flex-1">
                    <h5 className="font-semibold text-base sm:text-lg mb-3">Materials</h5>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm sm:text-base text-slate-600">
                      {modalProduct.materials?.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>

                    <h5 className="font-semibold text-base sm:text-lg mt-6 mb-3">Details</h5>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      Custom sizes and colour changes are available on request. Each piece is handmade — minor variations and unique textures are celebrated as part of the craft.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button 
                        onClick={() => openWhatsApp(modalProduct)} 
                        className="flex-1 px-6 py-3 rounded-full bg-[#A9744B] text-white text-sm sm:text-base font-medium hover:opacity-95 transition-opacity active:scale-95 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Order on WhatsApp
                      </button>
                      <button 
                        onClick={() => setModalProduct(null)} 
                        className="flex-1 px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-sm sm:text-base font-medium hover:bg-slate-50 transition-colors active:scale-95"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile WhatsApp Button */}
      <div className="fixed right-4 bottom-4 z-30">
        <button 
          onClick={() => openWhatsApp()} 
          className="p-4 rounded-full shadow-lg bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors active:scale-95"
          aria-label="WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </button>
      </div>
    </div>
  );
}