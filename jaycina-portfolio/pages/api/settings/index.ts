import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await prisma.siteSettings.findFirst()
      return res.status(200).json(settings)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch settings' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body as any
      const existing = await prisma.siteSettings.findFirst()
      const updated = existing
        ? await prisma.siteSettings.update({
            where: { id: existing.id },
            data: {
              whatsappNumber: body.whatsappNumber,
              siteTitle: body.siteTitle,
              siteDescription: body.siteDescription,
              heroTitle: body.heroTitle,
              heroSubtitle: body.heroSubtitle,
            },
          })
        : await prisma.siteSettings.create({
            data: {
              whatsappNumber: body.whatsappNumber,
              siteTitle: body.siteTitle,
              siteDescription: body.siteDescription,
              heroTitle: body.heroTitle,
              heroSubtitle: body.heroSubtitle,
            },
          })
      return res.status(200).json(updated)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save settings' })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


