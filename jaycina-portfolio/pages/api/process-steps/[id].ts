import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      type Body = { title: string; description: string; imageUrl: string; order?: number }
      const body = req.body as Body
      const updated = await prisma.processStep.update({
        where: { id: id as string },
        data: {
          title: body.title,
          description: body.description,
          imageUrl: body.imageUrl,
          order: Number(body.order ?? 0),
        },
      })
      return res.status(200).json(updated)
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to update process step' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.processStep.update({ where: { id: id as string }, data: { isActive: false } })
      return res.status(200).json({ message: 'Deleted' })
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to delete process step' })
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


