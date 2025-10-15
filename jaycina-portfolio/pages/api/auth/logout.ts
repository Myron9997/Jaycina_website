import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../src/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}


