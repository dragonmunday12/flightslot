'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { ScheduleWithRelations, Student, TimeBlock, BlockedDay, RequestWithRelations } from '@/types'

export default function InstructorCalendarPage() {
  const [schedules, setSchedules] = useState<ScheduleWithRelations[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([])
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [schedulingDate, setSchedulingDate] = useState<Date | null>(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<RequestWithRelations | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchData()
  }, [currentMonth])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const month = currentMonth.getMonth() + 1
      const year = currentMonth.getFullYear()

      const [schedulesRes, studentsRes, timeBlocksRes, blockedDaysRes, requestsRes] = await Promise.all([
        fetch(`/api/schedule?month=${month}&year=${year}`),
        fetch('/api/students'),
        fetch('/api/time-blocks'),
        fetch(`/api/blocked-days?month=${month}&year=${year}`),
        fetch('/api/requests'),
      ])

      const schedulesData = await schedulesRes.json()
      const studentsData = await studentsRes.json()
      const timeBlocksData = await timeBlocksRes.json()
      const blockedDaysData = await blockedDaysRes.json()
      const requestsData = await requestsRes.json()

      setSchedules(schedulesData)
      setStudents(studentsData)
      setTimeBlocks(timeBlocksData)
      setBlockedDays(blockedDaysData)
      const pendingRequests = requestsData.filter((r: RequestWithRelations) => r.status === 'pending')
      setRequests(pendingRequests)
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

  const getRequestsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return requests.filter((r) => format(new Date(r.date), 'yyyy-MM-dd') === dateStr)
  }

  const getAvailableTimeBlocksForDay = (date: Date) => {
    const daySchedules = getSchedulesForDay(date)
    const scheduledTimeBlockIds = daySchedules.map(s => s.timeBlockId)
    return timeBlocks.filter(tb => !scheduledTimeBlockIds.includes(tb.id))
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/approve`, { method: 'POST' })

      if (res.ok) {
        setSelectedRequest(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleDenyRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/deny`, { method: 'POST' })

      if (res.ok) {
        setSelectedRequest(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error denying request:', error)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string, studentName: string, timeBlockName: string, date: string) => {
    const confirmed = window.confirm(
      `Delete this scheduled event?\n\n` +
      `Student: ${studentName}\n` +
      `Time: ${timeBlockName}\n` +
      `Date: ${date}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) return

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

      if (res.ok) {
        setSchedulingDate(null)
        setSelectedStudent('')
        setSelectedTimeBlock('')
        fetchData()
      }
    } catch (error) {
      console.error('Error adding schedule:', error)
    }
  }

  const days = getDaysInMonth()
  const startDayOfWeek = days[0]?.getDay() || 0
  const emptyCells = Array(startDayOfWeek).fill(null)

  if (loading) {
    return <div className="text-center py-8 text-gray-900 dark:text-white">Loading...</div>
  }

  return (
    <>
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#f3f4f6' }}>Event Schedule</h1>
            <p style={{ color: '#d1d5db', marginTop: '0.25rem', fontSize: '0.875rem' }}>Manage student events and availability</p>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
              <span className="font-medium">{schedules.length}</span> events scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card p-6 mb-12">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
          <button
            onClick={handlePrevMonth}
            className="btn btn-secondary btn-sm hover:shadow"
          >
            ← Prev
          </button>
          <h2 className="text-gray-900 dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button
            onClick={handleNextMonth}
            className="btn btn-secondary btn-sm hover:shadow"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 pb-2">
              <span className="day-header-full">{day}</span>
              <span className="day-header-short">{day.charAt(0)}</span>
            </div>
          ))}

          {/* Empty cells */}
          {emptyCells.map((_, i) => (
            <div key={`empty-${i}`} className="h-[140px]" />
          ))}

          {/* Day cells */}
          {days.map((date) => {
            const daySchedules = getSchedulesForDay(date)
            const dayRequests = getRequestsForDay(date)
            const isBlocked = isDayBlocked(date)
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

            return (
              <div
                key={date.toISOString()}
                className={`
                  calendar-day
                  ${isToday ? 'calendar-day-today' : ''}
                  ${isBlocked ? 'calendar-day-blocked' : 'calendar-day-normal'}
                `}
                style={{ position: 'relative' }}
              >
                {schedulingDate?.getTime() !== date.getTime() && (
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{format(date, 'd')}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {!isBlocked && (
                        <button
                          onClick={() => {
                            setSchedulingDate(date)
                            setSelectedStudent('')
                            setSelectedTimeBlock('')
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6'
                            e.currentTarget.style.color = '#ffffff'
                            e.currentTarget.style.transform = 'scale(1.02)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = '#3b82f6'
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)'
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)'
                          }}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            color: '#3b82f6',
                            padding: '0.25rem 0.375rem',
                            whiteSpace: 'nowrap',
                            border: '1px solid #3b82f6',
                            borderRadius: '0.25rem',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          + Add
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (isBlocked) {
                            handleUnblockDay(date)
                          } else {
                            handleBlockDay(date)
                          }
                        }}
                        onMouseEnter={(e) => {
                          const bgColor = isBlocked ? '#ef4444' : '#6b7280'
                          e.currentTarget.style.backgroundColor = bgColor
                          e.currentTarget.style.color = '#ffffff'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = isBlocked ? '#ef4444' : '#6b7280'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.98)'
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          color: isBlocked ? '#ef4444' : '#6b7280',
                          padding: '0.25rem 0.375rem',
                          whiteSpace: 'nowrap',
                          border: `1px solid ${isBlocked ? '#ef4444' : '#6b7280'}`,
                          borderRadius: '0.25rem',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isBlocked ? 'Unlock' : 'Block'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  {schedulingDate?.getTime() === date.getTime() && (
                    <>
                      {/* Backdrop */}
                      <div
                        onClick={() => setSchedulingDate(null)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          zIndex: 40
                        }}
                      />
                      {/* Modal */}
                      <div style={{
                        position: 'fixed',
                        backgroundColor: '#1e293b',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        border: '2px solid #3b82f6',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        zIndex: 50,
                        minWidth: '200px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>
                        Add Schedule - {format(date, 'MMM d')}
                      </div>
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '0.875rem',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          backgroundColor: '#374151',
                          color: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select Student...</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedTimeBlock}
                        onChange={(e) => setSelectedTimeBlock(e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '0.875rem',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          backgroundColor: '#374151',
                          color: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select Time...</option>
                        {getAvailableTimeBlocksForDay(date).map((tb) => (
                          <option key={tb.id} value={tb.id}>
                            {tb.name}
                          </option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleAddSchedule(date, selectedStudent, selectedTimeBlock)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6'
                          }}
                          style={{
                            flex: 1,
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#ffffff',
                            backgroundColor: '#3b82f6',
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setSchedulingDate(null)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#4b5563'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#6b7280'
                          }}
                          style={{
                            flex: 1,
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#ffffff',
                            backgroundColor: '#6b7280',
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    </>
                  )}
                  {schedulingDate?.getTime() !== date.getTime() && (
                    <>
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="schedule-confirmed text-xs px-2 py-1.5 rounded-md cursor-pointer hover:shadow-sm transition-all group"
                          onClick={() => handleDeleteSchedule(
                            schedule.id,
                            schedule.student.name,
                            schedule.timeBlock.name,
                            format(date, 'MMMM d, yyyy')
                          )}
                          title="Click to delete"
                        >
                          <div className="font-semibold flex items-center gap-1">
                            <span className="truncate flex-1 min-w-0">{schedule.student.name}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 flex-shrink-0" style={{ fontSize: '1rem' }}>×</span>
                          </div>
                          <div className="text-[10px] opacity-75">{schedule.timeBlock.name}</div>
                        </div>
                      ))}
                      {dayRequests.map((request) => (
                        <div
                          key={request.id}
                          className="schedule-pending text-xs px-2 py-1.5 rounded-md cursor-pointer hover:shadow-sm transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRequest(request)
                          }}
                          title="Click to review request"
                        >
                          <div className="font-semibold truncate">
                            {request.student.name}
                          </div>
                          <div className="text-[10px] opacity-75">⏳ {request.timeBlock.name}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ rowGap: '1.5rem', columnGap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Events</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{schedules.length}</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending Requests</div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{requests.length}</div>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Students</div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{students.length}</div>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Blocked Days</div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{blockedDays.length}</div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>

      {/* Request Review Modal */}
      {selectedRequest ? (
        <div
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => {
            setSelectedRequest(null)
          }}
        >
          <div
            style={{
              backgroundColor: '#1f2937',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '28rem',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #4b5563' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>Event Request</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  color: '#9ca3af',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>Student</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>{selectedRequest.student.name}</div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>Date</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>
                  {format(new Date(selectedRequest.date), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>Time Slot</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>
                  {selectedRequest.timeBlock.name}
                  <span style={{ fontSize: '0.875rem', fontWeight: '400', color: '#9ca3af', marginLeft: '0.5rem' }}>
                    ({selectedRequest.timeBlock.startTime} - {selectedRequest.timeBlock.endTime})
                  </span>
                </div>
              </div>

              {selectedRequest.message && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>Message</div>
                  <div style={{ fontSize: '0.875rem', color: '#d1d5db', backgroundColor: '#374151', padding: '0.75rem', borderRadius: '0.375rem' }}>
                    {selectedRequest.message}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>Requested</div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => handleApproveRequest(selectedRequest.id)}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button
                onClick={() => handleDenyRequest(selectedRequest.id)}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Deny
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </>
  )
}
