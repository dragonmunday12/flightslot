import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE request (students can delete their own pending requests)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const requestData = await prisma.request.findUnique({
      where: { id },
    })

    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Students can only delete their own requests
    if (user.role === 'student' && requestData.studentId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own requests' },
        { status: 403 }
      )
    }

    // Can only delete pending requests
    if (requestData.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending requests' },
        { status: 400 }
      )
    }

    await prisma.request.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting request:', error)
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    )
  }
}
