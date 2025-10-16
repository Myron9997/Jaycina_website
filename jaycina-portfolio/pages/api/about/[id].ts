import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      type Body = { title: string; content: string; order?: number }
      const body = req.body as Body
      const updated = await prisma.aboutSection.update({
        where: { id: id as string },
        data: { title: body.title, content: body.content, order: Number(body.order ?? 0) },
      })
      return res.status(200).json(updated)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { data, error } = await supa
          .from('about_sections')
          .update({ title: (req.body as any).title, content: (req.body as any).content, order: Number((req.body as any).order ?? 0), updated_at: new Date().toISOString() })
          .eq('id', id as string)
          .select()
          .single()
        if (error) throw error
        return res.status(200).json({ id: data.id, title: data.title, content: data.content, order: data.order })
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to update about section' })
      }
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.aboutSection.update({ where: { id: id as string }, data: { isActive: false } })
      return res.status(200).json({ message: 'Deleted' })
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { error } = await supa.from('about_sections').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id as string)
        if (error) throw error
        return res.status(200).json({ message: 'Deleted' })
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to delete about section' })
      }
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


