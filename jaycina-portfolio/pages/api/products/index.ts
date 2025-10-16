import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'

function toArray(input: unknown): string[] {
  if (Array.isArray(input)) return input
  const str = String(input ?? '')
  if (!str) return []
  return str.split(',').map((s) => s.trim()).filter(Boolean)
}

function isValidUrl(u: string): boolean {
  return /^https?:\/\//i.test(u)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
      res.status(200).json(products)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { data, error } = await supa
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        if (error) throw error
        res.status(200).json(data)
      } catch (error: any) {
        console.error('GET /api/products failed:', error)
        res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(error?.message || error) : 'Failed to fetch products' })
      }
    }
  } else if (req.method === 'POST') {
    try {
      type Body = { title: string; category: string; priceInr: string; priceGbp: string; short: string; description?: string | null; materials?: string[] | string; images?: string[] | string }
      const body = req.body as Body
      const product = await prisma.product.create({
        data: {
          title: body.title,
          category: body.category,
          priceInr: body.priceInr,
          priceGbp: body.priceGbp,
          short: body.short,
          description: body.description ?? null,
          materials: toArray(body.materials),
          images: toArray(body.images).filter(isValidUrl),
          isActive: true,
        }
      })
      res.status(201).json(product)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const body = req.body as any
        const { data, error } = await supa
          .from('products')
          .insert({
            title: body.title,
            category: body.category,
            price_inr: body.priceInr,
            price_gbp: body.priceGbp,
            short: body.short,
            description: body.description ?? null,
            materials: toArray(body.materials),
            images: toArray(body.images).filter(isValidUrl),
            is_active: true,
          })
          .select()
          .single()
        if (error) throw error
        res.status(201).json(data)
      } catch (error: any) {
        console.error('POST /api/products failed:', error)
        res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(error?.message || error) : 'Failed to create product' })
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

