import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearEvents() {
  const clearBlockedDays = process.argv.includes('--with-blocked-days')

  try {
    console.log('🗑️  Clearing scheduled events...')
    console.log(`   Options: ${clearBlockedDays ? 'Including blocked days' : 'Excluding blocked days'}`)
    console.log('')

    // Delete all schedules
    const deletedSchedules = await prisma.schedule.deleteMany({})
    console.log(`✅ Deleted ${deletedSchedules.count} schedule(s)`)

    // Delete all requests
    const deletedRequests = await prisma.request.deleteMany({})
    console.log(`✅ Deleted ${deletedRequests.count} request(s)`)

    // Optionally delete blocked days
    if (clearBlockedDays) {
      const deletedBlockedDays = await prisma.blockedDay.deleteMany({})
      console.log(`✅ Deleted ${deletedBlockedDays.count} blocked day(s)`)
    } else {
      const blockedDaysCount = await prisma.blockedDay.count()
      console.log(`ℹ️  Kept ${blockedDaysCount} blocked day(s) (use --with-blocked-days to clear them)`)
    }

    console.log('')
    console.log('✨ Scheduled events cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing events:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearEvents()
