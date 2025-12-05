import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'

/**
 * Format a date to YYYY-MM-DD (for database storage)
 */
export function formatDateForDb(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format a time to HH:mm (for database storage)
 */
export function formatTimeForDb(date: Date): string {
  return format(date, 'HH:mm')
}

/**
 * Format a date for display
 */
export function formatDateForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy')
}

/**
 * Format a time for display (12-hour format)
 */
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return format(date, 'h:mm a')
}

/**
 * Get all days in a month
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return eachDayOfInterval({ start, end })
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Get the next month
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1)
}

/**
 * Get the previous month
 */
export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1)
}

/**
 * Parse a database date string to Date object
 */
export function parseDateFromDb(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay()
}

/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || ''
}

/**
 * Get short day name from day of week number
 */
export function getShortDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayOfWeek] || ''
}

/**
 * Get dates for recurring schedule
 */
export function getRecurringDates(
  daysOfWeek: number[],
  startDate: Date,
  endDate?: Date
): Date[] {
  const dates: Date[] = []
  const end = endDate || addMonths(startDate, 2) // Default to 2 months if no end date

  let current = new Date(startDate)
  while (current <= end) {
    if (daysOfWeek.includes(current.getDay())) {
      dates.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Generate a unique ID for recurring schedules
 */
export function generateRecurringId(): string {
  return `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate PIN format (4 digits)
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Simple validation for US phone numbers
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

/**
 * Clean phone number for database storage
 */
export function cleanPhoneForDb(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+${cleaned}`
  }
  return phone
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
