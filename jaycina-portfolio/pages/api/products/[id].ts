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
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: id as string }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      res.status(200).json(product)
    } catch (error) {
      console.error('Error fetching product:', error)
      res.status(500).json({ error: 'Failed to fetch product' })
    }
  } else if (req.method === 'PUT') {
    try {
      type Body = {
        title: string
        category: string
        priceInr: string
        priceGbp: string
        short: string
        description?: string | null
        materials?: string[] | string
        images?: string[] | string
      }
      const body = req.body as Body
      const product = await prisma.product.update({
        where: { id: id as string },
        data: {
          title: body.title,
          category: body.category,
          priceInr: body.priceInr,
          priceGbp: body.priceGbp,
          short: body.short,
          description: body.description ?? null,
          materials: toArray(body.materials),
          images: toArray(body.images).filter(isValidUrl),
        }
      })

      res.status(200).json(product)
    } catch (_error) {
      try {
        const supa = getServiceSupabase()
        const body = req.body as any
        const { data, error } = await supa
          .from('products')
          .update({
            title: body.title,
            category: body.category,
            price_inr: body.priceInr,
            price_gbp: body.priceGbp,
            short: body.short,
            description: body.description ?? null,
            materials: toArray(body.materials),
            images: toArray(body.images).filter(isValidUrl),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id as string)
          .select()
          .single()
        if (error) throw error
        res.status(200).json({
          id: data.id,
          title: data.title,
          category: data.category,
          priceInr: data.price_inr,
          priceGbp: data.price_gbp,
          short: data.short,
          description: data.description ?? null,
          materials: data.materials || [],
          images: data.images || [],
        })
      } catch (error) {
        console.error('Error updating product:', error)
        res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String((error as any)?.message || error) : 'Failed to update product' })
      }
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.product.update({ where: { id: id as string }, data: { isActive: false } })
      res.status(200).json({ message: 'Product deleted' })
    } catch (_error) {
      try {
        const supa = getServiceSupabase()
        const { error } = await supa
          .from('products')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id as string)
        if (error) throw error
        res.status(200).json({ message: 'Product deleted' })
      } catch (error) {
        console.error('Error deleting product:', error)
        res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String((error as any)?.message || error) : 'Failed to delete product' })
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

