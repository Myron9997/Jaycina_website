import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!supabaseUrl || !serviceRole) {
    return res.status(500).json({ error: 'Supabase configuration missing' })
  }

  const supabase = createClient(supabaseUrl, serviceRole)
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete user' })
    }
  }

  res.setHeader('Allow', ['DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}


