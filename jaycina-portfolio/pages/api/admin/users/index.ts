import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServiceSupabase } from '@/lib/supabase'
import bcrypt from 'bcrypt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({ select: { id: true, email: true, createdAt: true } })
      return res.status(200).json(users)
    } catch (_err) {
      try {
        const supa = getServiceSupabase()
        const { data, error } = await supa.from('users').select('id,email,created_at')
        if (error) throw error
        return res.status(200).json(
          (data || []).map((u: any) => ({ id: u.id, email: u.email, createdAt: u.created_at }))
        )
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to fetch users' })
      }
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body as { email?: string; password?: string }
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

      const passwordHash = await bcrypt.hash(password, 10)
      const created = await prisma.user.create({ data: { email, passwordHash } })
      return res.status(201).json({ id: created.id, email: created.email, createdAt: created.createdAt })
    } catch (_err) {
      try {
        const body = req.body as { email?: string; password?: string }
        const email = String(body.email || '').trim().toLowerCase()
        const password = String(body.password || '')
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

        const passwordHash = await bcrypt.hash(password, 10)
        const supa = getServiceSupabase()
        const { data, error } = await supa
          .from('users')
          .insert({ email, password_hash: passwordHash })
          .select('id,email,created_at')
          .single()
        if (error) throw error
        return res.status(201).json({ id: data.id, email: data.email, createdAt: data.created_at })
      } catch (err2: any) {
        return res.status(500).json({ error: process.env.NODE_ENV !== 'production' ? String(err2?.message || err2) : 'Failed to create user' })
      }
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


