import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      type Body = { title: string; description: string; imageUrl: string; order?: number }
      const body = req.body as Body
      const updated = await prisma.processStep.update({
        where: { id: id as string },
        data: { title: body.title, description: body.description, imageUrl: body.imageUrl, order: Number(body.order ?? 0) },
      })
      return res.status(200).json(updated)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const body = req.body as any
        const { data, error } = await supa
          .from('process_steps')
          .update({ title: body.title, description: body.description, image_url: body.imageUrl, order: Number(body.order ?? 0), updated_at: new Date().toISOString() })
          .eq('id', id as string)
          .select()
          .single()
        if (error) throw error
        return res.status(200).json({ id: data.id, title: data.title, description: data.description, imageUrl: data.image_url, order: data.order })
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to update process step' })
      }
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.processStep.update({ where: { id: id as string }, data: { isActive: false } })
      return res.status(200).json({ message: 'Deleted' })
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { error } = await supa.from('process_steps').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id as string)
        if (error) throw error
        return res.status(200).json({ message: 'Deleted' })
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to delete process step' })
      }
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


