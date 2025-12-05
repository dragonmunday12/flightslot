import { Student, TimeBlock, Schedule, Request, BlockedDay, Instructor } from '@prisma/client'

// Extended types with relations
export type StudentWithSchedules = Student & {
  schedules: Schedule[]
}

export type ScheduleWithRelations = Schedule & {
  student: Student
  timeBlock: TimeBlock
}

export type RequestWithRelations = Request & {
  student: Student
  timeBlock: TimeBlock
}

// Auth types
export type UserRole = 'instructor' | 'student'

export type AuthUser = {
  id: string
  role: UserRole
  name?: string
}

// Calendar types
export type CalendarDay = {
  date: Date
  isBlocked: boolean
  isToday: boolean
  isPast: boolean
  schedules: ScheduleWithRelations[]
}

export type TimeBlockWithSchedule = TimeBlock & {
  schedule?: ScheduleWithRelations
  isAvailable: boolean
}

// Request types
export type RequestStatus = 'pending' | 'approved' | 'denied'

// Recurring schedule types
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sunday = 0, Monday = 1, etc.

export type RecurringPattern = {
  days: DayOfWeek[]
  startDate: Date
  endDate?: Date
}

// Notification types
export type NotificationType = 'email' | 'sms' | 'both'

export type NotificationData = {
  to: string
  subject?: string
  message: string
  type: NotificationType
}

// Export Prisma types
export type {
  Student,
  TimeBlock,
  Schedule,
  Request,
  BlockedDay,
  Instructor,
}
