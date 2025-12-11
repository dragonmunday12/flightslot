import { NextRequest, NextResponse } from 'next/server'
import { authenticateWithPin, createSession } from '@/lib/auth'
import { isValidPin } from '@/lib/utils'
import { checkRateLimit } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Rate limiting: 5 attempts per minute per IP
    const rateLimit = checkRateLimit(`login:${ip}`, 5, 1, 60000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { pin } = await request.json()

    // Validate PIN format
    if (!pin || !isValidPin(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN format. PIN must be 4 digits.' },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateWithPin(pin)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid PIN. Please try again.' },
        { status: 401 }
      )
    }

    // Create session
    await createSession(user)

    // Return user info and redirect path
    return NextResponse.json({
      success: true,
      user,
      redirectTo: user.role === 'instructor' ? '/instructor' : '/student',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    )
  }
}
