import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT update time block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    const { name, startTime, endTime, order } = await request.json()

    const timeBlock = await prisma.timeBlock.update({
      where: { id },
      data: {
        name: name || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        order: order !== undefined ? order : undefined,
      },
    })

    return NextResponse.json(timeBlock)
  } catch (error) {
    console.error('Error updating time block:', error)
    return NextResponse.json(
      { error: 'Failed to update time block' },
      { status: 500 }
    )
  }
}

// DELETE time block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    // Check if time block has schedules
    const schedulesCount = await prisma.schedule.count({
      where: { timeBlockId: id },
    })

    if (schedulesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete time block with existing schedules' },
        { status: 400 }
      )
    }

    await prisma.timeBlock.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting time block:', error)
    return NextResponse.json(
      { error: 'Failed to delete time block' },
      { status: 500 }
    )
  }
}
