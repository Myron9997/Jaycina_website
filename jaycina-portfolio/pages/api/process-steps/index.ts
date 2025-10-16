import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.processStep.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
      return res.status(200).json(items)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { data, error } = await supa
          .from('process_steps')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true })
        if (error) throw error
        return res.status(200).json(data)
      } catch (err2: any) {
        console.error('GET /api/process-steps failed:', err2)
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to fetch process steps' })
      }
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
      try {
        const supa = getServiceSupabase()
        const body = req.body as { title: string; description: string; imageUrl: string; order?: number }
        const now = new Date().toISOString()
        const { data, error } = await supa
          .from('process_steps')
          .insert({ id: crypto.randomUUID(), title: body.title, description: body.description, image_url: body.imageUrl, order: Number(body.order ?? 0), is_active: true, created_at: now, updated_at: now })
          .select()
          .single()
        if (error) throw error
        return res.status(201).json(data)
      } catch (err2: any) {
        console.error('POST /api/process-steps failed:', err2)
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to create process step' })
      }
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


