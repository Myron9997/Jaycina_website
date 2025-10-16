import HomeClient from "./components/HomeClient";
import { getServiceSupabase } from "../lib/supabase";

export const revalidate = 900; // 15 minutes

export default async function Home(): Promise<JSX.Element> {
  const supa = getServiceSupabase()

  const [settingsRows, aboutRes, processRes, productsRes, testiRes] = await Promise.all([
    supa.from('site_settings').select('key,value').in('key', ['whatsappNumber','siteTitle','siteDescription','heroTitle','heroSubtitle','productCategories','logoUrl','madeInLocation','materialsLine','instagramUrl','facebookUrl']),
    supa.from('about_sections').select('*').eq('is_active', true).order('order', { ascending: true }),
    supa.from('process_steps').select('*').eq('is_active', true).order('order', { ascending: true }),
    supa.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    supa.from('testimonials').select('*').eq('is_active', true).order('order', { ascending: true }),
  ])

  const siteSettings = (() => {
    const out: any = {
      whatsappNumber: '', siteTitle: '', siteDescription: '', heroTitle: '', heroSubtitle: '',
      productCategories: [], logoUrl: '', madeInLocation: 'Goa, India', materialsLine: 'Alpaca · Merino · Cotton blends', instagramUrl: '', facebookUrl: ''
    }
    const rows = (settingsRows.data || []) as Array<{ key: string; value: string | null }>
    for (const r of rows) {
      if (r.key === 'productCategories') {
        try { out.productCategories = r.value ? JSON.parse(r.value) : [] } catch { out.productCategories = [] }
      } else {
        ;(out as any)[r.key] = r.value ?? ''
      }
    }
    return out
  })()
  const aboutSections = (aboutRes.data || []).map((r: any) => ({ id: r.id, title: r.title, content: r.content, order: r.order }))
  const processSteps = (processRes.data || []).map((r: any) => ({ id: r.id, title: r.title, description: r.description, imageUrl: r.image_url, order: r.order }))
  const products = (productsRes.data || []).map((r: any) => ({ id: r.id, title: r.title, category: r.category, priceInr: r.price_inr, priceGbp: r.price_gbp, short: r.short, description: r.description ?? undefined, materials: r.materials || [], images: r.images || [], isActive: r.is_active }))
  const testimonials = (testiRes.data || []).map((t: any) => ({ id: t.id, content: t.content, author: t.author, order: t.order }))

  return (
    <HomeClient
      initialProducts={products}
      initialAbout={aboutSections}
      initialProcess={processSteps}
      initialSettings={siteSettings}
      initialTestimonials={testimonials}
    />
  )
}


