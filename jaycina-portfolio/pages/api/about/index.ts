import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.aboutSection.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
      return res.status(200).json(items)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { data, error } = await supa
          .from('about_sections')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true })
        if (error) throw error
        return res.status(200).json(data)
      } catch (err2: any) {
        console.error('GET /api/about failed:', err2)
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to fetch about sections' })
      }
    }
  }

  if (req.method === 'POST') {
    try {
      type Body = { title: string; content: string; order?: number }
      const body = req.body as Body
      const created = await prisma.aboutSection.create({
        data: { title: body.title, content: body.content, order: Number(body.order ?? 0), isActive: true },
      })
      return res.status(201).json(created)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const body = req.body as { title: string; content: string; order?: number }
        const { data, error } = await supa
          .from('about_sections')
          .insert({ title: body.title, content: body.content, order: Number(body.order ?? 0), is_active: true })
          .select()
          .single()
        if (error) throw error
        return res.status(201).json(data)
      } catch (err2: any) {
        console.error('POST /api/about failed:', err2)
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to create about section' })
      }
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


