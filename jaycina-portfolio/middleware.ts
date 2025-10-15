import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

async function verify(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const method = req.method

  const needsAuth = (
    pathname.startsWith('/cms') ||
    (pathname.startsWith('/api/products') && method !== 'GET') ||
    (pathname.startsWith('/api/about') && method !== 'GET') ||
    (pathname.startsWith('/api/settings') && method !== 'GET')
  )

  if (!needsAuth) return NextResponse.next()

  const token = req.cookies.get('admin_token')?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  const payload = await verify(token)
  if (!payload) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/cms/:path*', '/api/:path*'],
}


