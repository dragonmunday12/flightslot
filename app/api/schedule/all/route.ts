import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all schedules (for students to see which slots are taken)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let whereClause: any = {}

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
        student: user.role === 'instructor', // Only include student info for instructors
        timeBlock: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // For students, return schedules without student info
    if (user.role === 'student') {
      return NextResponse.json(
        schedules.map((s) => ({
          id: s.id,
          date: s.date,
          timeBlockId: s.timeBlockId,
          timeBlock: s.timeBlock,
          studentId: s.studentId === user.id ? s.studentId : null, // Only reveal if it's their own
          isOwn: s.studentId === user.id,
        }))
      )
    }

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching all schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}
