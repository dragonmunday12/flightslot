import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearSchedules() {
  try {
    console.log('🗑️  Clearing all scheduled events...')

    // Delete all schedules
    const deletedSchedules = await prisma.schedule.deleteMany({})
    console.log(`✅ Deleted ${deletedSchedules.count} schedules`)

    // Delete all requests
    const deletedRequests = await prisma.request.deleteMany({})
    console.log(`✅ Deleted ${deletedRequests.count} requests`)

    // Delete all blocked days
    const deletedBlockedDays = await prisma.blockedDay.deleteMany({})
    console.log(`✅ Deleted ${deletedBlockedDays.count} blocked days`)

    console.log('✨ All scheduled events cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing schedules:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearSchedules()
