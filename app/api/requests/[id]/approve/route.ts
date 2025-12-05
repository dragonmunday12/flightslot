import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendRequestApprovedEmail } from '@/lib/notifications/email'
import { sendRequestApprovedSMS } from '@/lib/notifications/sms'
import { formatDateForDisplay } from '@/lib/utils'

// POST approve request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
        student: true,
        timeBlock: true,
      },
    })

    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (requestData.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      )
    }

    // Check if slot is still available
    const existing = await prisma.schedule.findUnique({
      where: {
        date_timeBlockId: {
          date: requestData.date,
          timeBlockId: requestData.timeBlockId,
        },
      },
    })

    if (existing) {
      // Update request to denied since slot is taken
      await prisma.request.update({
        where: { id },
        data: { status: 'denied' },
      })

      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 400 }
      )
    }

    // Create the schedule
    const schedule = await prisma.schedule.create({
      data: {
        studentId: requestData.studentId,
        date: requestData.date,
        timeBlockId: requestData.timeBlockId,
        isRecurring: false,
      },
      include: {
        student: true,
        timeBlock: true,
      },
    })

    // Update request status
    await prisma.request.update({
      where: { id },
      data: { status: 'approved' },
    })

    // Send notification to student
    const formattedDate = formatDateForDisplay(requestData.date)

    if (requestData.student.email) {
      await sendRequestApprovedEmail(
        requestData.student.email,
        requestData.student.name,
        formattedDate,
        requestData.timeBlock.name
      )
    }

    if (requestData.student.phone) {
      await sendRequestApprovedSMS(
        requestData.student.phone,
        requestData.student.name,
        formattedDate,
        requestData.timeBlock.name
      )
    }

    return NextResponse.json({
      success: true,
      schedule,
    })
  } catch (error) {
    console.error('Error approving request:', error)
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    )
  }
}
