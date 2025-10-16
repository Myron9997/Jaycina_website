import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
      return res.status(200).json(items)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { data, error } = await supa
          .from('testimonials')
          .select('id,content,author,order,is_active,created_at,updated_at')
          .eq('is_active', true)
          .order('order', { ascending: true })
        if (error) throw error
        return res.status(200).json(
          (data || []).map((t: any) => ({ id: t.id, content: t.content, author: t.author, order: t.order, isActive: t.is_active, createdAt: t.created_at, updatedAt: t.updated_at }))
        )
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to fetch testimonials' })
      }
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body as { content: string; author?: string; order?: number; isActive?: boolean }
      const created = await prisma.testimonial.create({
        data: { content: body.content, author: body.author ?? 'Anonymous', order: Number(body.order ?? 0), isActive: Boolean(body.isActive ?? true) }
      })
      return res.status(201).json(created)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const body = req.body as { content: string; author?: string; order?: number; isActive?: boolean }
        const now = new Date().toISOString()
        const { data, error } = await supa
          .from('testimonials')
          .insert({ id: crypto.randomUUID(), content: body.content, author: body.author ?? 'Anonymous', order: Number(body.order ?? 0), is_active: Boolean(body.isActive ?? true), created_at: now, updated_at: now })
          .select()
          .single()
        if (error) throw error
        return res.status(201).json({ id: data.id, content: data.content, author: data.author, order: data.order, isActive: data.is_active, createdAt: data.created_at, updatedAt: data.updated_at })
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to create testimonial' })
      }
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


