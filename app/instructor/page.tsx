'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { ScheduleWithRelations, Student, TimeBlock, BlockedDay } from '@/types'

export default function InstructorCalendarPage() {
  const [schedules, setSchedules] = useState<ScheduleWithRelations[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [schedulingDate, setSchedulingDate] = useState<Date | null>(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('')

  useEffect(() => {
    fetchData()
  }, [currentMonth])

  const fetchData = async () => {
    setLoading(true)
    try {
      const month = currentMonth.getMonth() + 1
      const year = currentMonth.getFullYear()

      const [schedulesRes, studentsRes, timeBlocksRes, blockedDaysRes] = await Promise.all([
        fetch(`/api/schedule?month=${month}&year=${year}`),
        fetch('/api/students'),
        fetch('/api/time-blocks'),
        fetch(`/api/blocked-days?month=${month}&year=${year}`),
      ])

      const schedulesData = await schedulesRes.json()
      const studentsData = await studentsRes.json()
      const timeBlocksData = await timeBlocksRes.json()
      const blockedDaysData = await blockedDaysRes.json()

      setSchedules(schedulesData)
      setStudents(studentsData)
      setTimeBlocks(timeBlocksData)
      setBlockedDays(blockedDaysData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = []
    const current = new Date(start)

    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const getSchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return schedules.filter((s) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
  }

  const isDayBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return blockedDays.some((bd) => format(new Date(bd.date), 'yyyy-MM-dd') === dateStr)
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const res = await fetch(`/api/schedule/${scheduleId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  const handleBlockDay = async (date: Date) => {
    try {
      const res = await fetch('/api/blocked-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: format(date, 'yyyy-MM-dd') }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error blocking day:', error)
    }
  }

  const handleUnblockDay = async (date: Date) => {
    const blockedDay = blockedDays.find(
      (bd) => format(new Date(bd.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )

    if (!blockedDay) return

    try {
      const res = await fetch(`/api/blocked-days/${blockedDay.id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error unblocking day:', error)
    }
  }

  const handleAddSchedule = async (date: Date, studentId: string, timeBlockId: string) => {
    if (!studentId || !timeBlockId) {
      alert('Please select both a student and time block')
      return
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          timeBlockId,
          dates: [dateStr],
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSchedulingDate(null)
        setSelectedStudent('')
        setSelectedTimeBlock('')
        fetchData()
      } else {
        alert(data.error || 'Failed to add schedule')
      }
    } catch (error) {
      console.error('Error adding schedule:', error)
      alert('An error occurred')
    }
  }

  const days = getDaysInMonth()
  const startDayOfWeek = days[0]?.getDay() || 0
  const emptyCells = Array(startDayOfWeek).fill(null)

  if (loading) {
    return <div className="text-center py-8 text-gray-900 dark:text-white">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flight Schedule</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Click "Add" on any day to schedule a student</p>
      </div>

      {/* Month Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            ← Previous
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells */}
          {emptyCells.map((_, i) => (
            <div key={`empty-${i}`} className="h-[140px]" />
          ))}

          {/* Day cells */}
          {days.map((date) => {
            const daySchedules = getSchedulesForDay(date)
            const isBlocked = isDayBlocked(date)
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

            return (
              <div
                key={date.toISOString()}
                className={`
                  border rounded-lg p-2 h-[140px] overflow-y-auto transition-colors
                  ${isToday ? 'border-blue-500 dark:border-blue-400 border-2' : 'border-gray-200 dark:border-gray-600'}
                  ${isBlocked ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-700'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{format(date, 'd')}</span>
                  <div className="flex gap-1">
                    {!isBlocked && schedulingDate?.getTime() !== date.getTime() && (
                      <button
                        onClick={() => {
                          setSchedulingDate(date)
                          setSelectedStudent('')
                          setSelectedTimeBlock('')
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Add
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isBlocked) {
                          handleUnblockDay(date)
                        } else {
                          if (confirm(`Block ${format(date, 'MMMM d, yyyy')}? No schedules can be created on blocked days.`)) {
                            handleBlockDay(date)
                          }
                        }
                      }}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {isBlocked ? '✓ Blocked' : 'Block'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {schedulingDate?.getTime() === date.getTime() ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded space-y-2">
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-1 py-1"
                      >
                        <option value="">Select student...</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedTimeBlock}
                        onChange={(e) => setSelectedTimeBlock(e.target.value)}
                        className="w-full text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-1 py-1"
                      >
                        <option value="">Select time...</option>
                        {timeBlocks.map((tb) => (
                          <option key={tb.id} value={tb.id}>
                            {tb.name} ({tb.startTime}-{tb.endTime})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAddSchedule(date, selectedStudent, selectedTimeBlock)}
                          className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setSchedulingDate(null)}
                          className="flex-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        title="Click to delete"
                      >
                        <div className="font-medium truncate">{schedule.student.name}</div>
                        <div className="text-[10px]">{schedule.timeBlock.name}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{schedules.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Schedules This Month</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{students.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{blockedDays.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Blocked Days This Month</div>
        </div>
      </div>

    </div>
  )
}
