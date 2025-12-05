import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all blocked days
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let whereClause: any = {}

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0))
      const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59))

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const blockedDays = await prisma.blockedDay.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(blockedDays)
  } catch (error) {
    console.error('Error fetching blocked days:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocked days' },
      { status: 500 }
    )
  }
}

// POST create blocked day (instructor only)
export async function POST(request: NextRequest) {
  try {
    await requireInstructor()

    const { date, reason } = await request.json()

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Parse date at noon UTC to avoid timezone issues
    const blockedDate = new Date(date + 'T12:00:00.000Z')

    // Delete any pending requests for this date before blocking
    await prisma.request.deleteMany({
      where: {
        date: blockedDate,
        status: 'pending',
      },
    })

    const blockedDay = await prisma.blockedDay.create({
      data: {
        date: blockedDate,
        reason: reason || null,
      },
    })

    return NextResponse.json(blockedDay)
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This day is already blocked' },
        { status: 400 }
      )
    }

    console.error('Error creating blocked day:', error)
    return NextResponse.json(
      { error: 'Failed to create blocked day' },
      { status: 500 }
    )
  }
}
