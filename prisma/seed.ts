import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default instructor account
  const defaultPin = process.env.INSTRUCTOR_PIN || '0000'
  const hashedPin = await bcrypt.hash(defaultPin, 10)

  const instructor = await prisma.instructor.upsert({
    where: { id: 'default-instructor' },
    update: {},
    create: {
      id: 'default-instructor',
      pin: hashedPin,
      email: null,
      phone: null,
    },
  })

  console.log('✅ Created default instructor account')
  console.log(`   PIN: ${defaultPin}`)
  console.log('   ⚠️  IMPORTANT: Change this PIN in the settings after first login!')

  // Create default time blocks
  const timeBlocks = [
    {
      name: 'Morning',
      startTime: '08:00',
      endTime: '12:00',
      order: 1,
    },
    {
      name: 'Early Afternoon',
      startTime: '12:00',
      endTime: '15:00',
      order: 2,
    },
    {
      name: 'Late Afternoon',
      startTime: '15:00',
      endTime: '18:00',
      order: 3,
    },
    {
      name: 'Evening',
      startTime: '18:00',
      endTime: '21:00',
      order: 4,
    },
  ]

  for (const block of timeBlocks) {
    await prisma.timeBlock.upsert({
      where: { name: block.name },
      update: {
        startTime: block.startTime,
        endTime: block.endTime,
        order: block.order,
      },
      create: block,
    })
  }

  console.log('✅ Created default time blocks:')
  console.log('   - Morning (8:00 AM - 12:00 PM)')
  console.log('   - Early Afternoon (12:00 PM - 3:00 PM)')
  console.log('   - Late Afternoon (3:00 PM - 6:00 PM)')
  console.log('   - Evening (6:00 PM - 9:00 PM)')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Next steps:')
  console.log('   1. Run: npm run dev')
  console.log('   2. Visit: http://localhost:3000')
  console.log(`   3. Login with PIN: ${defaultPin}`)
  console.log('   4. Change your PIN and configure email/phone in settings')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
