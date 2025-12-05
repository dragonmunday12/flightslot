import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireStudent, requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendRequestNotificationEmail } from '@/lib/notifications/email'
import { sendRequestNotificationSMS } from '@/lib/notifications/sms'
import { formatDateForDisplay } from '@/lib/utils'

// GET all requests (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    let whereClause: any = {}

    // Students can only see their own requests
    if (user.role === 'student') {
      whereClause.studentId = user.id
    }

    // Instructors can see all requests
    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        student: true,
        timeBlock: true,
      },
      orderBy: [
        { status: 'asc' }, // Pending first
        { date: 'asc' },
      ],
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

// POST create new request (students only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireStudent()

    const { date, timeBlockId, message } = await request.json()

    if (!date || !timeBlockId) {
      return NextResponse.json(
        { error: 'Date and time block are required' },
        { status: 400 }
      )
    }

    // Parse date at noon UTC to avoid timezone issues
    const requestDate = new Date(date + 'T12:00:00.000Z')

    // Check if slot is already taken
    const existing = await prisma.schedule.findUnique({
      where: {
        date_timeBlockId: {
          date: requestDate,
          timeBlockId: timeBlockId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This time slot is already taken' },
        { status: 400 }
      )
    }

    // Check if day is blocked
    const blocked = await prisma.blockedDay.findUnique({
      where: { date: requestDate },
    })

    if (blocked) {
      return NextResponse.json(
        { error: 'This day is blocked by the instructor' },
        { status: 400 }
      )
    }

    // Check if student already has a pending request for this slot
    const pendingRequest = await prisma.request.findFirst({
      where: {
        studentId: user.id,
        date: requestDate,
        timeBlockId: timeBlockId,
        status: 'pending',
      },
    })

    if (pendingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this time slot' },
        { status: 400 }
      )
    }

    // Create the request
    const newRequest = await prisma.request.create({
      data: {
        studentId: user.id,
        date: requestDate,
        timeBlockId,
        message: message || null,
        status: 'pending',
      },
      include: {
        student: true,
        timeBlock: true,
      },
    })

    // Send notifications to instructor
    const instructor = await prisma.instructor.findFirst()

    if (instructor) {
      const formattedDate = formatDateForDisplay(requestDate)

      if (instructor.email) {
        await sendRequestNotificationEmail(
          instructor.email,
          newRequest.student.name,
          formattedDate,
          newRequest.timeBlock.name
        )
      }

      if (instructor.phone) {
        await sendRequestNotificationSMS(
          instructor.phone,
          newRequest.student.name,
          formattedDate,
          newRequest.timeBlock.name
        )
      }
    }

    return NextResponse.json(newRequest)
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}
