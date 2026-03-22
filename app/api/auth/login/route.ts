import { NextResponse } from 'next/server'
import {
  createSessionToken,
  isValidPassword,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!(await isValidPassword(password))) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    const token = await createSessionToken(password)

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_SECONDS,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Failed to process login', error)
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
  }
}
