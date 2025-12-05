import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    const { searchParams } = new URL(request.url)
    const deleteRecurring = searchParams.get('deleteRecurring') === 'true'

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // If deleting all recurring instances
    if (deleteRecurring && schedule.isRecurring && schedule.recurringId) {
      await prisma.schedule.deleteMany({
        where: { recurringId: schedule.recurringId },
      })

      return NextResponse.json({ success: true, deletedCount: 'all recurring' })
    } else {
      // Delete single instance
      await prisma.schedule.delete({
        where: { id },
      })

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
