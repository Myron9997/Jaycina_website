import type { NextApiRequest, NextApiResponse } from 'next'
import { signJwt } from '../../../src/lib/jwt'
import bcrypt from 'bcrypt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    // Use Supabase REST API instead of Prisma since PostgreSQL connection is failing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' })
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch user data' })
    }

    const users = await response.json()
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = users[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const secret = process.env.JWT_SECRET?.trim()
    if (!secret) {
      return res.status(500).json({ error: 'JWT secret not configured on server (JWT_SECRET)' })
    }

    const token = await signJwt({ sub: user.id, role: 'admin' })

    // Use SameSite=Lax to avoid any strict-mode blockers during client navigation
    res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=7200${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
    return res.status(200).json({ ok: true })
  } catch (err: unknown) {
    // Provide a clearer server-side error and a helpful client response
    // eslint-disable-next-line no-console
    console.error('Login error:', err)
    const message = (err as Error)?.message || 'Internal server error'
    return res.status(500).json({ error: 'Internal server error during login.' })
  }
}


