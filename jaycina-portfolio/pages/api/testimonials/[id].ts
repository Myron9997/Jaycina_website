import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      await prisma.testimonial.update({ where: { id: id as string }, data: { isActive: false } })
      return res.status(200).json({ message: 'Deleted' })
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { error } = await supa
          .from('testimonials')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id as string)
        if (error) throw error
        return res.status(200).json({ message: 'Deleted' })
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to delete testimonial' })
      }
    }
  }

  res.setHeader('Allow', ['DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


