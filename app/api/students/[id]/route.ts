import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPin, generatePin } from '@/lib/auth'
import { sendPinResetSMS } from '@/lib/notifications/sms'

// GET single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            timeBlock: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

// PUT update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    const { name, phone, email } = await request.json()

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: name || undefined,
        phone: phone || null,
        email: email || null,
      },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    await prisma.student.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
