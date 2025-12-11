import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPin, generatePin } from '@/lib/auth'
import { sendStudentWelcomeEmail } from '@/lib/notifications/email'
import { sendStudentWelcomeSMS } from '@/lib/notifications/sms'
import { validateStudentName, sanitizeEmail, sanitizePhone } from '@/lib/validation'

// GET all students
export async function GET(request: NextRequest) {
  try {
    await requireInstructor()

    const students = await prisma.student.findMany({
      orderBy: { name: 'asc' },
      include: {
        schedules: {
          include: {
            timeBlock: true,
          },
        },
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST create new student
export async function POST(request: NextRequest) {
  try {
    await requireInstructor()

    const { name, phone, email } = await request.json()

    // Validate student name
    const nameValidation = validateStudentName(name)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error || 'Invalid name' },
        { status: 400 }
      )
    }

    // Sanitize and validate email if provided
    let sanitizedEmail: string | null = null
    if (email) {
      sanitizedEmail = sanitizeEmail(email)
      if (!sanitizedEmail) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }
    }

    // Sanitize and validate phone if provided
    let sanitizedPhone: string | null = null
    if (phone) {
      sanitizedPhone = sanitizePhone(phone)
      if (!sanitizedPhone) {
        return NextResponse.json(
          { error: 'Invalid phone number' },
          { status: 400 }
        )
      }
    }

    // Generate a random PIN for the student
    const pin = generatePin()
    const hashedPin = await hashPin(pin)

    // Create student
    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        phone: sanitizedPhone,
        email: sanitizedEmail,
        pin: hashedPin,
      },
    })

    // Send welcome notifications
    if (sanitizedEmail) {
      await sendStudentWelcomeEmail(name.trim(), sanitizedEmail, pin)
    }
    if (sanitizedPhone) {
      await sendStudentWelcomeSMS(name.trim(), sanitizedPhone, pin)
    }

    return NextResponse.json({
      student,
      pin, // Return PIN so instructor can see it
    })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
