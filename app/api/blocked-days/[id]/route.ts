import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE blocked day
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await params

    await prisma.blockedDay.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blocked day:', error)
    return NextResponse.json(
      { error: 'Failed to delete blocked day' },
      { status: 500 }
    )
  }
}
