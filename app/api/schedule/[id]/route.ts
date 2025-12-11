import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
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

    // Students can only delete their own schedules that were created from requests
    if (user.role === 'student') {
      if (schedule.studentId !== user.id) {
        return NextResponse.json(
          { error: 'You can only delete your own schedules' },
          { status: 403 }
        )
      }

      if (schedule.createdByInstructor) {
        return NextResponse.json(
          { error: 'You cannot delete schedules created by your instructor' },
          { status: 403 }
        )
      }
    }

    // If deleting all recurring instances (instructors only)
    if (deleteRecurring && schedule.isRecurring && schedule.recurringId) {
      if (user.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can delete recurring schedules' },
          { status: 403 }
        )
      }

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
