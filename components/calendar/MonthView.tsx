'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { TimeBlockWithSchedule, ScheduleWithRelations } from '@/types'

type MonthViewProps = {
  schedules: ScheduleWithRelations[]
  timeBlocks: TimeBlockWithSchedule[]
  blockedDays: string[]
  onDayClick?: (date: Date) => void
  onTimeSlotClick?: (date: Date, timeBlockId: string) => void
  viewMode: 'instructor' | 'student'
  currentStudentId?: string
}

export function MonthView({
  schedules,
  timeBlocks,
  blockedDays,
  onDayClick,
  onTimeSlotClick,
  viewMode,
  currentStudentId,
}: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the starting day of week (0 = Sunday)
  const startDayOfWeek = getDay(monthStart)

  // Calculate empty cells for calendar grid
  const emptyCells = Array(startDayOfWeek).fill(null)

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getSchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return schedules.filter((s) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
  }

  const isDayBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return blockedDays.includes(dateStr)
  }

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {daysInMonth.map((date) => {
          const daySchedules = getSchedulesForDay(date)
          const isBlocked = isDayBlocked(date)
          const isTodayDate = isToday(date)

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDayClick?.(date)}
              className={`
                aspect-square border rounded-lg p-2 cursor-pointer transition-all
                ${isTodayDate ? 'border-blue-500 border-2' : 'border-gray-200'}
                ${isBlocked ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}
              `}
            >
              <div className="text-sm font-semibold mb-1">
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {isBlocked ? (
                  <div className="text-xs text-red-600 font-medium">Blocked</div>
                ) : (
                  daySchedules.slice(0, 3).map((schedule) => {
                    const isCurrentStudent = schedule.studentId === currentStudentId
                    const showName = viewMode === 'instructor' || isCurrentStudent

                    return (
                      <div
                        key={schedule.id}
                        className={`
                          text-xs px-1 py-0.5 rounded truncate
                          ${showName ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}
                        `}
                        title={showName ? schedule.student.name : 'Unavailable'}
                      >
                        {showName ? schedule.student.name : 'Unavailable'}
                      </div>
                    )
                  })
                )}
                {daySchedules.length > 3 && (
                  <div className="text-xs text-gray-500">+{daySchedules.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
