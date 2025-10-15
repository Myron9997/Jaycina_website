import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!supabaseUrl || !serviceRole) {
    return res.status(500).json({ error: 'Storage not configured' })
  }

  const { fileBase64, filename } = req.body as { fileBase64?: string; filename?: string }
  if (!fileBase64 || !filename) return res.status(400).json({ error: 'fileBase64 and filename required' })

  // fileBase64 expected like: data:image/png;base64,AAAA...
  const commaIdx = fileBase64.indexOf(',')
  const base64 = commaIdx >= 0 ? fileBase64.substring(commaIdx + 1) : fileBase64
  const buffer = Buffer.from(base64, 'base64')

  const supabase = createClient(supabaseUrl, serviceRole)
  const bucket = 'product-images'
  const path = `${Date.now()}-${filename}`

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: guessContentType(filename),
    upsert: false,
  })
  if (error) return res.status(500).json({ error: error.message })

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
  return res.status(200).json({ url: pub.publicUrl })
}

function guessContentType(name: string) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}



