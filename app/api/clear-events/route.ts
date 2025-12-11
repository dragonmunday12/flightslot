import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST clear events (schedules, requests, optionally blocked days)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only instructors can clear events
    if (user.role !== 'instructor') {
      return NextResponse.json(
        { error: 'Only instructors can clear events' },
        { status: 403 }
      )
    }

    const { includeBlockedDays } = await request.json()

    console.log('Clearing events:', { includeBlockedDays })

    // Delete all schedules
    const deletedSchedules = await prisma.schedule.deleteMany({})
    console.log(`Deleted ${deletedSchedules.count} schedules`)

    // Delete all requests
    const deletedRequests = await prisma.request.deleteMany({})
    console.log(`Deleted ${deletedRequests.count} requests`)

    let response: any = {
      schedulesDeleted: deletedSchedules.count,
      requestsDeleted: deletedRequests.count,
    }

    if (includeBlockedDays) {
      // Delete all blocked days
      const deletedBlockedDays = await prisma.blockedDay.deleteMany({})
      console.log(`Deleted ${deletedBlockedDays.count} blocked days`)
      response.blockedDaysDeleted = deletedBlockedDays.count
    } else {
      // Count blocked days that were kept
      const blockedDaysCount = await prisma.blockedDay.count()
      console.log(`Kept ${blockedDaysCount} blocked days`)
      response.blockedDaysKept = blockedDaysCount
    }

    console.log('Events cleared successfully')

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error clearing events:', error)
    return NextResponse.json(
      { error: 'Failed to clear events' },
      { status: 500 }
    )
  }
}
