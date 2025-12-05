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

  useEffect(() => {
    fetchData()
  }, [currentMonth])

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
      // Note: The API will filter this on backend if student, showing only their own
      // For this demo, we'll just use the same data
      setAllSchedules(schedulesData)

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

  const handleRequestSlot = async (date: Date, timeBlockId: string, message: string) => {
    if (!timeBlockId) {
      alert('Please select a time block')
      return
    }

    try {
      // Format date at noon UTC to avoid timezone issues
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

      const data = await res.json()

      if (res.ok) {
        alert('Request submitted successfully! Your instructor will review it.')
        setRequestingDate(null)
        setSelectedTimeBlock('')
        setRequestMessage('')
        fetchData()
      } else {
        alert(data.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('An error occurred')
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Cancel this request?')) return

    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: 'DELETE' })

      if (res.ok) {
        alert('Request cancelled')
        fetchData()
      }
    } catch (error) {
      console.error('Error cancelling request:', error)
    }
  }

  const days = getDaysInMonth()
  const startDayOfWeek = days[0]?.getDay() || 0
  const emptyCells = Array(startDayOfWeek).fill(null)

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Flight Schedule</h1>
        <p className="text-gray-600 mt-2">View your scheduled flight times and request new slots</p>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-yellow-900">
                {pendingRequests.length} Pending Request{pendingRequests.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-yellow-800">
                Waiting for instructor approval
              </p>
            </div>
            <div className="space-x-2">
              {pendingRequests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => handleCancelRequest(req.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cancel {format(new Date(req.date), 'MMM d')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded">
            ← Previous
          </button>
          <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded">
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
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
            const pendingRequests = getPendingRequestsForDay(date)
            const isBlocked = isDayBlocked(date)
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

            return (
              <div
                key={date.toISOString()}
                className={`
                  border rounded-lg p-2 h-[140px] overflow-y-auto
                  ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                  ${isBlocked ? 'bg-gray-100' : 'bg-white'}
                  ${isPast ? 'opacity-50' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">{format(date, 'd')}</span>
                  {!isBlocked && !isPast && requestingDate?.getTime() !== date.getTime() && (
                    <button
                      onClick={() => {
                        setRequestingDate(date)
                        setSelectedTimeBlock('')
                        setRequestMessage('')
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Request
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {isBlocked ? (
                    <div className="text-xs text-gray-600">Unavailable</div>
                  ) : requestingDate?.getTime() === date.getTime() ? (
                    <div className="bg-blue-50 p-2 rounded space-y-2">
                      <select
                        value={selectedTimeBlock}
                        onChange={(e) => setSelectedTimeBlock(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        <option value="">Select time...</option>
                        {timeBlocks.map((tb) => (
                          <option key={tb.id} value={tb.id}>
                            {tb.name} ({tb.startTime}-{tb.endTime})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Optional message..."
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleRequestSlot(date, selectedTimeBlock, requestMessage)}
                          className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setRequestingDate(null)}
                          className="flex-1 text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {mySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          <div className="font-medium">✓ {schedule.timeBlock.name}</div>
                        </div>
                      ))}
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded"
                        >
                          <div className="font-medium">⏳ {req.timeBlock.name}</div>
                          <div className="text-[10px]">Pending</div>
                        </div>
                      ))}
                      {allDaySchedules.length > mySchedules.length && (
                        <div className="text-xs text-gray-500">
                          {allDaySchedules.length - mySchedules.length} slot(s) unavailable
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* My Schedules List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Upcoming Flights ({schedules.length})
        </h2>

        {schedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No scheduled flights. Request a time slot to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {format(new Date(schedule.date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {schedule.timeBlock.name} ({schedule.timeBlock.startTime} -{' '}
                    {schedule.timeBlock.endTime})
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
