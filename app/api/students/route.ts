import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPin, generatePin } from '@/lib/auth'
import { sendStudentWelcomeEmail } from '@/lib/notifications/email'
import { sendStudentWelcomeSMS } from '@/lib/notifications/sms'

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

    if (!name) {
      return NextResponse.json(
        { error: 'Student name is required' },
        { status: 400 }
      )
    }

    // Generate a random PIN for the student
    const pin = generatePin()
    const hashedPin = await hashPin(pin)

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        pin: hashedPin,
      },
    })

    // Send welcome notifications
    if (email) {
      await sendStudentWelcomeEmail(name, email, pin)
    }
    if (phone) {
      await sendStudentWelcomeSMS(name, phone, pin)
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
