import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPin, generatePin } from '@/lib/auth'
import { sendPinResetSMS } from '@/lib/notifications/sms'

// POST reset student PIN
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Generate new PIN
    const newPin = generatePin()
    const hashedPin = await hashPin(newPin)

    // Update student PIN
    await prisma.student.update({
      where: { id },
      data: { pin: hashedPin },
    })

    // Send SMS notification if phone is available
    if (student.phone) {
      await sendPinResetSMS(student.name, student.phone, newPin)
    }

    return NextResponse.json({
      success: true,
      pin: newPin,
    })
  } catch (error) {
    console.error('Error resetting PIN:', error)
    return NextResponse.json(
      { error: 'Failed to reset PIN' },
      { status: 500 }
    )
  }
}
