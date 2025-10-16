import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Keys we support for site settings
const SUPPORTED_KEYS = [
  'whatsappNumber',
  'siteTitle',
  'siteDescription',
  'heroTitle',
  'heroSubtitle',
  // Additional settings
  'productCategories',
  'logoUrl',
  'madeInLocation',
  'materialsLine',
] as const

type SupportedKey = typeof SUPPORTED_KEYS[number]

function normalizeCategoryName(input: string): string {
  const trimmed = String(input || '').trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  return trimmed
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const rows = await prisma.siteSettings.findMany({
        where: { key: { in: SUPPORTED_KEYS as unknown as string[] } },
      })

      const result: Record<string, unknown> = {
        whatsappNumber: '',
        siteTitle: '',
        siteDescription: '',
        heroTitle: '',
        heroSubtitle: '',
        productCategories: [],
        logoUrl: '',
        madeInLocation: 'Goa, India',
        materialsLine: 'Alpaca · Merino · Cotton blends',
      }

      for (const row of rows) {
        if (!(SUPPORTED_KEYS as readonly string[]).includes(row.key)) continue
        if (row.key === 'productCategories') {
          try {
            result.productCategories = row.value ? JSON.parse(row.value) : []
          } catch {
            result.productCategories = []
          }
        } else {
          result[row.key] = row.value ?? ''
        }
      }

      return res.status(200).json(result)
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to fetch settings' })
    }
  }

  if (req.method === 'PUT') {
    try {
      type Body = { whatsappNumber?: string; siteTitle?: string; siteDescription?: string; heroTitle?: string; heroSubtitle?: string; productCategories?: string[]; logoUrl?: string; madeInLocation?: string; materialsLine?: string }
      const body = (req.body ?? {}) as Body

      // Build upsert operations for provided keys only
      const ops = SUPPORTED_KEYS
        .filter((k) => typeof body[k] === 'string')
        .map((k) =>
          prisma.siteSettings.upsert({
            where: { key: k },
            update: { value: String(body[k] ?? '') },
            create: { key: k, value: String(body[k] ?? '') },
          })
        )

      // Handle array-typed settings separately
      if (Array.isArray(body.productCategories)) {
        // Normalize (trim, collapse spaces, Title Case) and dedupe case-insensitively
        const normalized = body.productCategories
          .map((c) => normalizeCategoryName(String(c)))
          .filter((c) => c.length > 0)

        const seen = new Set<string>()
        const deduped: string[] = []
        for (const c of normalized) {
          const key = c.toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          deduped.push(c)
        }

        ops.push(
          prisma.siteSettings.upsert({
            where: { key: 'productCategories' },
            update: { value: JSON.stringify(deduped) },
            create: { key: 'productCategories', value: JSON.stringify(deduped) },
          })
        )
      }

      await prisma.$transaction(ops)

      // Return the latest values
      const rows = await prisma.siteSettings.findMany({ where: { key: { in: SUPPORTED_KEYS as unknown as string[] } } })
      const result: Record<string, unknown> = { whatsappNumber: '', siteTitle: '', siteDescription: '', heroTitle: '', heroSubtitle: '', productCategories: [], logoUrl: '', madeInLocation: 'Goa, India', materialsLine: 'Alpaca · Merino · Cotton blends' }
      for (const row of rows) {
        if (!(SUPPORTED_KEYS as readonly string[]).includes(row.key)) continue
        if (row.key === 'productCategories') {
          try { (result as any).productCategories = row.value ? JSON.parse(row.value) : [] } catch { (result as any).productCategories = [] }
        } else {
          ;(result as any)[row.key] = row.value ?? ''
        }
      }

      return res.status(200).json(result)
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to save settings' })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


