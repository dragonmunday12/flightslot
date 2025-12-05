import { NextRequest, NextResponse } from 'next/server'
import { authenticateWithPin, createSession } from '@/lib/auth'
import { isValidPin } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
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
