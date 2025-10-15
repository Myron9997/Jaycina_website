import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  // In dev, avoid crashing import; runtime routes will still error clearly if missing
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET is not set. Set it in your .env/.env.local')
}

function getKey() {
  if (!JWT_SECRET) throw new Error('JWT_SECRET missing')
  return new TextEncoder().encode(JWT_SECRET)
}

export async function signJwt(payload: Record<string, unknown>, expiresInSeconds = 2 * 60 * 60) {
  const key = getKey()
  const now = Math.floor(Date.now() / 1000)
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(key)
}

export async function verifyJwt(token: string) {
  const key = getKey()
  const { payload } = await jwtVerify(token, key)
  return payload
}



