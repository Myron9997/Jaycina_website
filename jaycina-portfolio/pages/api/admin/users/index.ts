import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!supabaseUrl || !serviceRole) {
    return res.status(500).json({ error: 'Supabase configuration missing' })
  }

  const supabase = createClient(supabaseUrl, serviceRole)

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(Array.isArray(data) ? data : [])
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch users' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { email, password } = req.body as { email?: string; password?: string }
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
      const passwordHash = await bcrypt.hash(password, 12)
      const id = randomUUID()
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('users')
        .insert({ id, email, password_hash: passwordHash, created_at: now, updated_at: now })
        .select('id, email, created_at')
        .single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create user' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


