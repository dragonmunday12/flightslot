import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all time blocks
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const timeBlocks = await prisma.timeBlock.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(timeBlocks)
  } catch (error) {
    console.error('Error fetching time blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time blocks' },
      { status: 500 }
    )
  }
}

// POST create time block (instructor only)
export async function POST(request: NextRequest) {
  try {
    await requireInstructor()

    const { name, startTime, endTime, order } = await request.json()

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, start time, and end time are required' },
        { status: 400 }
      )
    }

    const timeBlock = await prisma.timeBlock.create({
      data: {
        name,
        startTime,
        endTime,
        order: order || 999,
      },
    })

    return NextResponse.json(timeBlock)
  } catch (error) {
    console.error('Error creating time block:', error)
    return NextResponse.json(
      { error: 'Failed to create time block' },
      { status: 500 }
    )
  }
}
