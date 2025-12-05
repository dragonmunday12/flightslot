import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPin } from '@/lib/auth'

// GET instructor settings
export async function GET(request: NextRequest) {
  try {
    await requireInstructor()

    const instructor = await prisma.instructor.findFirst()

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    // Don't return the hashed PIN
    const { pin, ...settings } = instructor

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT update instructor settings
export async function PUT(request: NextRequest) {
  try {
    await requireInstructor()

    const { email, phone, newPin } = await request.json()

    const instructor = await prisma.instructor.findFirst()

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (email !== undefined) updateData.email = email || null
    if (phone !== undefined) updateData.phone = phone || null

    // Update PIN if provided
    if (newPin) {
      if (!/^\d{4}$/.test(newPin)) {
        return NextResponse.json(
          { error: 'PIN must be exactly 4 digits' },
          { status: 400 }
        )
      }
      updateData.pin = await hashPin(newPin)
    }

    const updated = await prisma.instructor.update({
      where: { id: instructor.id },
      data: updateData,
    })

    // Don't return the hashed PIN
    const { pin, ...settings } = updated

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
