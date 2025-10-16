"use client";

import React, { useEffect, useState } from "react";

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

type AboutSection = { id: string; title: string; content: string; order: number };
type ProcessStep = { id: string; title: string; description: string; imageUrl: string; order: number };
type Testimonial = { id: string; content: string; author: string; order: number };

type SiteSettings = {
  siteTitle?: string;
  siteDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  whatsappNumber?: string;
  productCategories?: string[];
  logoUrl?: string;
  madeInLocation?: string;
  materialsLine?: string;
  instagramUrl?: string;
  facebookUrl?: string;
};

export default function HomeClient({
  initialProducts,
  initialAbout,
  initialProcess,
  initialSettings,
  initialTestimonials,
}: {
  initialProducts: Product[];
  initialAbout: AboutSection[];
  initialProcess: ProcessStep[];
  initialSettings: SiteSettings;
  initialTestimonials: Testimonial[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings || {});
  const [aboutSections] = useState<AboutSection[]>(initialAbout || []);
  const [processSteps] = useState<ProcessStep[]>(initialProcess || []);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials || []);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  const WHATSAPP_NUMBER = "YOUR_NUMBER_HERE";

  const categoriesFromSettings = Array.isArray(siteSettings.productCategories)
    ? siteSettings.productCategories
    : undefined;
  const categories = [
    "All",
    ...(categoriesFromSettings && categoriesFromSettings.length > 0
      ? categoriesFromSettings
      : Array.from(new Set(products.map((p) => p.category)))),
  ];

  function openWhatsApp(product?: Product) {
    const text = product
      ? encodeURIComponent(`Hello ${siteSettings.siteTitle || ""}, I'm interested in the ${product.title} (${product.id}). Could you share size & price details?`)
      : encodeURIComponent("Hello, I'm interested in your crochet products. Could you share details on availability and prices?");
    const number = siteSettings.whatsappNumber || WHATSAPP_NUMBER;
    const url = `https://wa.me/${number}?text=${text}`;
    window.open(url, "_blank");
  }

  const filtered = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] antialiased" suppressHydrationWarning>
      {/* Mobile-optimized Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#E8D7C0] to-[#CFA57A] flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm">
                {siteSettings.logoUrl ? (
                  <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>J</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl truncate whitespace-nowrap">{siteSettings.siteTitle || 'Weave and Glow Magic'}</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block truncate">{siteSettings.siteDescription || 'Handmade crochet & wool creations'}</p>
              </div>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#collection" className="text-sm hover:underline transition-colors">Collection</a>
              <a href="#about" className="text-sm hover:underline transition-colors">About</a>
              <a href="#howto" className="text-sm hover:underline transition-colors">How to Order</a>
            </nav>
            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              {mounted && (
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
              )}
            </div>
          </div>
          {mounted && isMobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-slate-200">
              <nav className="flex flex-col gap-4">
                <a href="#collection" className="text-sm py-2 hover:underline transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Collection</a>
                <a href="#about" className="text-sm py-2 hover:underline transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                <a href="#howto" className="text-sm py-2 hover:underline transition-colors" onClick={() => setIsMobileMenuOpen(false)}>How to Order</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-6">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 sm:py-14">
          <div className="order-2 lg:order-1">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-6xl leading-tight">
              {siteSettings.heroTitle || 'Handmade crochet, crafted with patience.'}
            </h2>
            <p className="mt-4 sm:mt-6 text-slate-700 text-sm sm:text-base max-w-xl">
              {siteSettings.heroSubtitle || 'Scarves, beanies, gloves, cosy woolen tees and woven bags — every piece made by hand with care. Bespoke orders welcome.'}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a href="#collection" className="btn-secondary text-center">Browse Collection</a>
              {mounted && (
                <button onClick={() => openWhatsApp()} className="btn-primary">Order via WhatsApp</button>
              )}
            </div>
            <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-6 text-sm text-slate-600">
              <div>
                <div className="font-semibold">Made in</div>
                <div className="text-xs sm:text-sm">{siteSettings.madeInLocation || 'Goa, India'}</div>
              </div>
              <div>
                <div className="font-semibold">Materials</div>
                <div className="text-xs sm:text-sm">{siteSettings.materialsLine || 'Alpaca · Merino · Cotton blends'}</div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={products[0]?.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&q=80&auto=format&fit=crop"} 
              alt="Hero product" 
              className="w-full h-64 sm:h-80 lg:h-96 object-cover" 
            />
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-8 sm:py-12 border-t border-slate-100">
          <div className="max-w-4xl">
            <h3 className="font-serif text-xl sm:text-2xl">About {siteSettings.siteTitle || 'Jaycina'}</h3>
            {aboutSections.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aboutSections.slice().sort((a,b)=>a.order-b.order).map((s) => (
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

        {/* Collection */}
        <section id="collection" className="py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="font-serif text-xl sm:text-2xl">Signature Collection</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {mounted && categories.map((c) => (
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
                      <img src={url} alt={p.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
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
                    {mounted && (
                      <>
                        <button onClick={() => setModalProduct(p)} className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-colors active:scale-95">View</button>
                        <button onClick={() => openWhatsApp(p)} className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-full bg-[#A9744B] text-white hover:opacity-95 transition-opacity active:scale-95">Order</button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Process */}
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

        {/* Testimonials */}
        <section className="py-8 sm:py-12">
          <h3 className="font-serif text-xl sm:text-2xl mb-6">What people say</h3>
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.sort((a,b)=>a.order-b.order).map((t) => (
                <div key={t.id} className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-slate-700 text-sm sm:text-base">{t.content}</div>
                  <div className="mt-4 font-semibold text-sm sm:text-base">— {t.author || 'Anonymous'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-600">No testimonials yet.</div>
          )}
          {mounted && (
            <div className="mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <h4 className="font-semibold mb-3">Share your experience</h4>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.target as HTMLFormElement)
                const payload = {
                  content: String(fd.get('content') || ''),
                  author: String(fd.get('author') || 'Anonymous'),
                  order: testimonials.length + 1,
                }
                if (!payload.content.trim()) return
                setSubmittingTestimonial(true)
                try {
                  const res = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) throw new Error(data.error || 'Failed to submit')
                  setTestimonials((prev) => [...prev, data])
                  ;(e.target as HTMLFormElement).reset()
                  alert('Thanks for sharing!')
                } catch (err: any) {
                  alert(err.message || 'Failed to submit')
                } finally {
                  setSubmittingTestimonial(false)
                }
              }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start" autoComplete="off" data-lpignore="true" data-form-type="other">
                <textarea name="content" rows={3} required placeholder="Your message" className="sm:col-span-2 border border-slate-300 rounded-md px-3 py-2" autoComplete="off" data-lpignore="true" />
                <div className="flex flex-col gap-2">
                  <input name="author" placeholder="Your name (optional)" className="border border-slate-300 rounded-md px-3 py-2" autoComplete="off" data-lpignore="true" />
                  <button type="submit" disabled={submittingTestimonial} className="px-4 py-2 rounded-md bg-[#A9744B] text-white disabled:opacity-50">{submittingTestimonial ? 'Submitting…' : 'Submit'}</button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* WhatsApp Floating */}
        {mounted && (
          <div className="fixed right-4 bottom-4 z-30">
            <button onClick={() => openWhatsApp()} className="p-4 rounded-full shadow-lg bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors active:scale-95" aria-label="WhatsApp">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
            </button>
          </div>
        )}
      </main>
      {mounted && modalProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalProduct(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white rounded-t-xl">
              <h3 className="font-serif text-lg sm:text-xl font-semibold truncate pr-4">{modalProduct.title}</h3>
              <button onClick={() => setModalProduct(null)} className="p-2 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0" aria-label="Close modal">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-4 lg:p-6 bg-slate-50 space-y-4">
                  <img src={modalProduct.images?.[0]} alt={modalProduct.title} className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-sm" />
                  {modalProduct.images?.slice(1).map((src, i) => (
                    <img key={i} src={src} alt={`${modalProduct.title}-${i+1}`} className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm" />
                  ))}
                </div>
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
                      {modalProduct.materials?.map((m, i) => (<li key={i}>{m}</li>))}
                    </ul>
                    {modalProduct.description && (
                      <>
                        <h5 className="font-semibold text-base sm:text-lg mt-6 mb-3">Details</h5>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{modalProduct.description}</p>
                      </>
                    )}
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button onClick={() => openWhatsApp(modalProduct)} className="flex-1 px-6 py-3 rounded-full bg-[#A9744B] text-white text-sm sm:text-base font-medium hover:opacity-95 transition-opacity active:scale-95">Order on WhatsApp</button>
                      <button onClick={() => setModalProduct(null)} className="flex-1 px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-sm sm:text-base font-medium hover:bg-slate-50 transition-colors active:scale-95">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
        <footer className="py-8 sm:py-12 border-t border-slate-100">
          <div className="flex flex-col gap-6 text-center sm:text-center">
          <div>
            <div className="font-serif text-lg sm:text-xl">{siteSettings.siteTitle || 'Jaycina'}</div>
            <div className="text-sm text-slate-600">Handmade crochet & woolwear — Goa</div>
          </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-center gap-4 sm:gap-6">
            <a href="#about" className="text-sm hover:underline transition-colors">About</a>
            <a href="#collection" className="text-sm hover:underline transition-colors">Collection</a>
            <a href="#howto" className="text-sm hover:underline transition-colors">Order</a>
          </div>

            <div className="flex items-center justify-center sm:justify-center gap-4">
            {siteSettings.whatsappNumber && (
              <a
                href={`https://wa.me/${siteSettings.whatsappNumber}`}
                aria-label="WhatsApp"
                className="p-2 rounded-full border hover:bg-slate-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
              </a>
            )}
            {siteSettings.instagramUrl && (
              <a href={siteSettings.instagramUrl} aria-label="Instagram" className="p-2 rounded-full border hover:bg-slate-100 transition-colors" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-.75a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z"/></svg>
              </a>
            )}
            {siteSettings.facebookUrl && (
              <a href={siteSettings.facebookUrl} aria-label="Facebook" className="p-2 rounded-full border hover:bg-slate-100 transition-colors" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.073C22 6.477 17.523 2 11.927 2 6.332 2 1.855 6.477 1.855 12.073c0 4.997 3.657 9.139 8.438 9.927v-7.023H7.898v-2.904h2.395V9.845c0-2.368 1.41-3.678 3.566-3.678 1.034 0 2.116.185 2.116.185v2.33h-1.192c-1.176 0-1.543.73-1.543 1.48v1.777h2.625l-.42 2.904h-2.205V22c4.78-.788 8.438-4.93 8.438-9.927z"/></svg>
              </a>
            )}
          </div>

          <div className="text-sm text-slate-500">© {new Date().getFullYear()} {siteSettings.siteTitle || 'Jaycina'}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}


