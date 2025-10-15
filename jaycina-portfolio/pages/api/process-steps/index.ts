import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.processStep.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
      return res.status(200).json(items)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch process steps' })
    }
  }

  if (req.method === 'POST') {
    try {
      type Body = { title: string; description: string; imageUrl: string; order?: number }
      const body = req.body as Body
      const created = await prisma.processStep.create({
        data: {
          title: body.title,
          description: body.description,
          imageUrl: body.imageUrl,
          order: Number(body.order ?? 0),
          isActive: true,
        },
      })
      return res.status(201).json(created)
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to create process step' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


