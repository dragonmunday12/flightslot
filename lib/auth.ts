import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './db'
import { AuthUser } from '@/types'

const SALT_ROUNDS = 10

/**
 * Hash a PIN for storage
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

/**
 * Verify a PIN against a hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

/**
 * Generate a random 4-digit PIN
 */
export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Authenticate a user with a PIN
 * Returns the authenticated user or null
 */
export async function authenticateWithPin(pin: string): Promise<AuthUser | null> {
  // Try instructor first
  const instructor = await prisma.instructor.findFirst()
  if (instructor && await verifyPin(pin, instructor.pin)) {
    return {
      id: instructor.id,
      role: 'instructor',
      name: 'Instructor',
    }
  }

  // Try students
  const students = await prisma.student.findMany()
  for (const student of students) {
    if (await verifyPin(pin, student.pin)) {
      return {
        id: student.id,
        role: 'student',
        name: student.name,
      }
    }
  }

  return null
}

/**
 * Create a session for a user
 */
export async function createSession(user: AuthUser): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(user)

  cookieStore.set('session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie?.value) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as AuthUser
  } catch {
    return null
  }
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Require instructor role - throws if not instructor
 */
export async function requireInstructor(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'instructor') {
    throw new Error('Forbidden: Instructor access required')
  }
  return user
}

/**
 * Require student role - throws if not student
 */
export async function requireStudent(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'student') {
    throw new Error('Forbidden: Student access required')
  }
  return user
}
