import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
    } catch (error) {
      console.error('Error updating product:', error)
      res.status(500).json({ error: 'Failed to update product' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.product.update({
        where: { id: id as string },
        data: { isActive: false }
      })

      res.status(200).json({ message: 'Product deleted' })
    } catch (error) {
      console.error('Error deleting product:', error)
      res.status(500).json({ error: 'Failed to delete product' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

