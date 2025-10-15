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
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })

      res.status(200).json(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      res.status(500).json({ error: 'Failed to fetch products' })
    }
  } else if (req.method === 'POST') {
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
    } catch (error) {
      console.error('Error creating product:', error)
      res.status(500).json({ error: 'Failed to create product' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

