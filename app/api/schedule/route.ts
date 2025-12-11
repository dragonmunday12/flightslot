import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getRecurringDates, generateRecurringId } from '@/lib/utils'

// GET all schedules (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let whereClause: any = {}

    // Students can only see their own schedules
    if (user.role === 'student') {
      whereClause.studentId = user.id
    }

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        student: true,
        timeBlock: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST create schedule(s)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only instructors can create schedules
    if (user.role !== 'instructor') {
      return NextResponse.json(
        { error: 'Only instructors can create schedules' },
        { status: 403 }
      )
    }

    const { studentId, timeBlockId, dates, recurring } = await request.json()

    if (!studentId || !timeBlockId) {
      return NextResponse.json(
        { error: 'Student and time block are required' },
        { status: 400 }
      )
    }

    // Handle recurring schedules
    if (recurring && recurring.days && recurring.days.length > 0) {
      console.log('Recurring schedule request received:', JSON.stringify(recurring, null, 2))

      // Validate end date is provided
      if (!recurring.endDate || recurring.endDate === '') {
        console.log('ERROR: End date is missing or empty')
        return NextResponse.json(
          { error: 'End date is required for recurring schedules' },
          { status: 400 }
        )
      }

      // Validate days array
      if (!recurring.days || recurring.days.length === 0) {
        console.log('ERROR: No days selected')
        return NextResponse.json(
          { error: 'Please select at least one day of the week' },
          { status: 400 }
        )
      }

      const recurringId = generateRecurringId()
      // Parse dates at noon UTC to avoid timezone issues
      const startDate = new Date(recurring.startDate + 'T12:00:00.000Z')
      const endDate = new Date(recurring.endDate + 'T12:00:00.000Z')

      console.log('Parsed dates - Start:', startDate.toISOString(), 'End:', endDate.toISOString())
      console.log('Start:', recurring.startDate, '→', startDate.toDateString())
      console.log('End:', recurring.endDate, '→', endDate.toDateString())

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('ERROR: Invalid date format')
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }

      if (endDate < startDate) {
        console.log('ERROR: End date is before start date')
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        )
      }

      const recurringDates = getRecurringDates(
        recurring.days,
        startDate,
        endDate
      )

      console.log(`Creating recurring schedule: ${recurringDates.length} dates from ${recurring.startDate} to ${recurring.endDate}`)
      console.log('Selected days of week:', recurring.days)
      console.log('First 5 dates:', recurringDates.slice(0, 5).map(d => d.toISOString()))
      console.log('Last 5 dates:', recurringDates.slice(-5).map(d => d.toISOString()))

      if (recurringDates.length === 0) {
        return NextResponse.json(
          { error: 'No dates match the selected criteria' },
          { status: 400 }
        )
      }

      if (recurringDates.length > 365) {
        return NextResponse.json(
          { error: 'Date range is too large (maximum 365 occurrences)' },
          { status: 400 }
        )
      }

      const schedules = []

      for (const date of recurringDates) {
        // Check if slot is already taken
        const existing = await prisma.schedule.findUnique({
          where: {
            date_timeBlockId: {
              date: date,
              timeBlockId: timeBlockId,
            },
          },
        })

        if (existing) continue // Skip if already taken

        // Check if day is blocked
        const blocked = await prisma.blockedDay.findUnique({
          where: { date: date },
        })

        if (blocked) continue // Skip blocked days

        const schedule = await prisma.schedule.create({
          data: {
            studentId,
            timeBlockId,
            date,
            isRecurring: true,
            recurringId,
          },
          include: {
            student: true,
            timeBlock: true,
          },
        })

        schedules.push(schedule)
      }

      return NextResponse.json(schedules)
    } else {
      // Single date schedule
      if (!dates || dates.length === 0) {
        return NextResponse.json(
          { error: 'At least one date is required' },
          { status: 400 }
        )
      }

      const schedules = []

      for (const dateStr of dates) {
        // Parse date at noon UTC to avoid timezone issues
        const date = new Date(dateStr + 'T12:00:00.000Z')

        // Check if slot is already taken
        const existing = await prisma.schedule.findUnique({
          where: {
            date_timeBlockId: {
              date: date,
              timeBlockId: timeBlockId,
            },
          },
        })

        if (existing) {
          return NextResponse.json(
            { error: `Time slot on ${dateStr} is already taken` },
            { status: 400 }
          )
        }

        // Check if day is blocked
        const blocked = await prisma.blockedDay.findUnique({
          where: { date: date },
        })

        if (blocked) {
          return NextResponse.json(
            { error: `Day ${dateStr} is blocked` },
            { status: 400 }
          )
        }

        const schedule = await prisma.schedule.create({
          data: {
            studentId,
            timeBlockId,
            date,
            isRecurring: false,
          },
          include: {
            student: true,
            timeBlock: true,
          },
        })

        schedules.push(schedule)
      }

      return NextResponse.json(schedules)
    }
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}
