import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST deny request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
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

    if (requestData.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      )
    }

    // Update request status
    await prisma.request.update({
      where: { id },
      data: { status: 'denied' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error denying request:', error)
    return NextResponse.json(
      { error: 'Failed to deny request' },
      { status: 500 }
    )
  }
}
