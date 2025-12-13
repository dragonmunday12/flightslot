'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ScheduleWithRelations, TimeBlock, RequestWithRelations, BlockedDay } from '@/types'

export default function StudentDashboardPage() {
  const [schedules, setSchedules] = useState<ScheduleWithRelations[]>([])
  const [allSchedules, setAllSchedules] = useState<ScheduleWithRelations[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [requestingDate, setRequestingDate] = useState<Date | null>(null)
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
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

      // Fetch student's own schedules
      const schedulesRes = await fetch(`/api/schedule?month=${month}&year=${year}`)
      const schedulesData = await schedulesRes.json()
      setSchedules(schedulesData)

      // Fetch all schedules to show unavailable slots
      const allSchedulesRes = await fetch(`/api/schedule/all?month=${month}&year=${year}`)
      const allSchedulesData = await allSchedulesRes.json()
      setAllSchedules(allSchedulesData)

      const [timeBlocksRes, requestsRes, blockedDaysRes] = await Promise.all([
        fetch('/api/time-blocks'),
        fetch('/api/requests'),
        fetch(`/api/blocked-days?month=${month}&year=${year}`),
      ])

      setTimeBlocks(await timeBlocksRes.json())
      setRequests(await requestsRes.json())
      setBlockedDays(await blockedDaysRes.json())
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

  const getMySchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return schedules.filter((s) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
  }

  const getAllSchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return allSchedules.filter((s) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
  }

  const isDayBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return blockedDays.some((bd) => format(new Date(bd.date), 'yyyy-MM-dd') === dateStr)
  }

  const getPendingRequestsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return requests.filter(
      (r) => r.status === 'pending' && format(new Date(r.date), 'yyyy-MM-dd') === dateStr
    )
  }

  const getOtherStudentsSchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const allDaySchedules = allSchedules.filter((s: any) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
    return allDaySchedules.filter((s: any) => !s.isOwn)
  }

  const getTakenTimeBlockIds = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const allDaySchedules = allSchedules.filter((s: any) => format(new Date(s.date), 'yyyy-MM-dd') === dateStr)
    const pendingRequests = getPendingRequestsForDay(date)
    const takenIds = new Set(allDaySchedules.map((s: any) => s.timeBlockId))
    pendingRequests.forEach((r) => takenIds.add(r.timeBlockId))
    return takenIds
  }

  const getAvailableTimeBlocksForDay = (date: Date) => {
    const takenIds = getTakenTimeBlockIds(date)
    return timeBlocks.filter(tb => !takenIds.has(tb.id))
  }

  const handleRequestSlot = async (date: Date, timeBlockId: string, message: string) => {
    if (!timeBlockId) {
      alert('Please select a time slot')
      return
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          timeBlockId,
          message: message || null,
        }),
      })

      if (res.ok) {
        alert('Request submitted successfully! Your instructor will review it soon.')
        setRequestingDate(null)
        setSelectedTimeBlock('')
        setRequestMessage('')
        fetchData()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to submit request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('An error occurred while submitting your request. Please try again.')
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: 'DELETE' })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error cancelling request:', error)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string, timeBlockName: string, date: string) => {
    const confirmed = window.confirm(
      `Cancel this scheduled event?\n\n` +
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

  const days = getDaysInMonth()
  const startDayOfWeek = days[0]?.getDay() || 0
  const emptyCells = Array(startDayOfWeek).fill(null)

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  if (loading) {
    return <div className="text-center py-8 text-gray-900 dark:text-white">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#f3f4f6' }}>My Event Schedule</h1>
            <p style={{ color: '#d1d5db', marginTop: '0.25rem', fontSize: '0.875rem' }}>View scheduled events and request new time slots</p>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
              <span className="font-medium">{schedules.filter(s => new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length}</span> upcoming events
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6 mb-6">
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
            const mySchedules = getMySchedulesForDay(date)
            const allDaySchedules = getAllSchedulesForDay(date)
            const otherSchedules = getOtherStudentsSchedulesForDay(date)
            const pendingRequests = getPendingRequestsForDay(date)
            const takenTimeBlockIds = getTakenTimeBlockIds(date)
            const isBlocked = isDayBlocked(date)
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

            return (
              <div
                key={date.toISOString()}
                className={`
                  calendar-day
                  ${isToday ? 'calendar-day-today' : ''}
                  ${isBlocked ? 'calendar-day-blocked' : 'calendar-day-normal'}
                  ${isPast ? 'opacity-50' : ''}
                `}
                style={{ position: 'relative' }}
              >
                {requestingDate?.getTime() !== date.getTime() && (
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{format(date, 'd')}</span>
                    </div>
                    {!isBlocked && !isPast && (
                      <button
                        onClick={() => {
                          setRequestingDate(date)
                          setSelectedTimeBlock('')
                          setRequestMessage('')
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
                        + Request
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  {requestingDate?.getTime() === date.getTime() && (
                    <>
                      {/* Backdrop */}
                      <div
                        onClick={() => setRequestingDate(null)}
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
                        minWidth: '250px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>
                          Request Time - {format(date, 'MMM d')}
                        </div>
                        {getAvailableTimeBlocksForDay(date).length === 0 ? (
                          <div style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '1rem', textAlign: 'center' }}>
                            No available time slots for this day
                          </div>
                        ) : (
                          <>
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
                                  {tb.name} ({tb.startTime} - {tb.endTime})
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={requestMessage}
                              onChange={(e) => setRequestMessage(e.target.value)}
                              placeholder="Optional message..."
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
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleRequestSlot(date, selectedTimeBlock, requestMessage)}
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
                                Request
                              </button>
                              <button
                                onClick={() => setRequestingDate(null)}
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
                          </>
                        )}
                      </div>
                    </>
                  )}
                  {isBlocked ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">🔒 Unavailable</div>
                  ) : requestingDate?.getTime() !== date.getTime() && (
                    <>
                      {mySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`${
                            schedule.createdByInstructor
                              ? 'schedule-confirmed-locked'
                              : 'schedule-confirmed cursor-pointer hover:shadow-sm transition-all group'
                          } text-xs px-2 py-1.5 rounded-md`}
                          onClick={() => {
                            if (!schedule.createdByInstructor) {
                              handleDeleteSchedule(
                                schedule.id,
                                schedule.timeBlock.name,
                                format(date, 'MMMM d, yyyy')
                              )
                            }
                          }}
                          title={!schedule.createdByInstructor ? 'Click to remove' : 'Scheduled by instructor'}
                        >
                          <div className="font-semibold flex items-center justify-between">
                            <span>✓ {schedule.timeBlock.name}</span>
                            {!schedule.createdByInstructor && (
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600">×</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="schedule-pending text-xs px-2 py-1.5 rounded-md cursor-pointer hover:shadow-sm transition-all group"
                          onClick={() => handleCancelRequest(req.id)}
                          title="Click to cancel request"
                        >
                          <div className="font-semibold flex items-center justify-between">
                            <span>{req.timeBlock.name}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600">×</span>
                          </div>
                          <div className="text-[10px] opacity-75">⏳ Pending</div>
                        </div>
                      ))}
                      {otherSchedules.map((schedule: any) => (
                        <div
                          key={schedule.id}
                          className="schedule-reserved text-xs px-2 py-1.5 rounded-md"
                          title="This time slot is already reserved by another student"
                        >
                          <div className="font-semibold">
                            {schedule.timeBlock.name}
                          </div>
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

      {/* My Schedules List */}
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700" style={{ marginLeft: '-2rem', marginRight: '-2rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Upcoming Events</h3>
          <span className="badge badge-info">{schedules.filter(s => new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length} events</span>
        </div>

        {schedules.filter(s => new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming scheduled events. Click "+ Request" on any day to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.filter(s => new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0))).map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(schedule.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {schedule.timeBlock.name} • {schedule.timeBlock.startTime} -{' '}
                      {schedule.timeBlock.endTime}
                      {!schedule.createdByInstructor && (
                        <span className="text-xs ml-2 text-blue-600 dark:text-blue-400">(You can remove this from calendar)</span>
                      )}
                    </div>
                  </div>
                </div>
                {!schedule.createdByInstructor && (
                  <button
                    onClick={() => handleDeleteSchedule(
                      schedule.id,
                      schedule.timeBlock.name,
                      format(new Date(schedule.date), 'MMMM d, yyyy')
                    )}
                    className="btn btn-accent btn-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
