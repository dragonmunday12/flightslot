'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Student, TimeBlock } from '@/types'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [newPin, setNewPin] = useState('')

  // Schedule form states
  const [scheduleDate, setScheduleDate] = useState('')
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [recurringEndDate, setRecurringEndDate] = useState('')

  useEffect(() => {
    fetchStudents()
    fetchTimeBlocks()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
    setLoading(false)
  }

  const fetchTimeBlocks = async () => {
    try {
      const res = await fetch('/api/time-blocks')
      const data = await res.json()
      setTimeBlocks(data)
    } catch (error) {
      console.error('Error fetching time blocks:', error)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email || null, phone: phone || null }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to add student')
        return
      }

      setNewPin(data.pin)
      fetchStudents()
      setName('')
      setEmail('')
      setPhone('')

      // Show PIN to instructor
      alert(`Student added successfully!\n\nGenerated PIN: ${data.pin}\n\nThis PIN has been sent to the student via ${phone ? 'SMS' : ''}${email && phone ? ' and ' : ''}${email ? 'email' : ''}.`)
      setShowAddModal(false)
    } catch (error) {
      setError('An error occurred while adding the student')
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? All their schedules will be removed.')) {
      return
    }

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchStudents()
      }
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const handleResetPin = async (id: string) => {
    if (!confirm('Generate a new PIN for this student?')) return

    try {
      const res = await fetch(`/api/students/${id}/reset-pin`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        alert(`New PIN generated: ${data.pin}\n\nThis PIN has been sent to the student via SMS.`)
      }
    } catch (error) {
      console.error('Error resetting PIN:', error)
    }
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent || !selectedTimeBlock) return

    try {
      const payload: any = {
        studentId: selectedStudent.id,
        timeBlockId: selectedTimeBlock,
      }

      if (isRecurring) {
        payload.recurring = {
          days: selectedDays,
          startDate: scheduleDate,
          endDate: recurringEndDate || undefined,
        }
      } else {
        payload.dates = [scheduleDate]
      }

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert('Schedule added successfully!')
        setShowScheduleModal(false)
        setScheduleDate('')
        setSelectedTimeBlock('')
        setIsRecurring(false)
        setSelectedDays([])
        setRecurringEndDate('')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add schedule')
      }
    } catch (error) {
      console.error('Error adding schedule:', error)
      alert('An error occurred')
    }
  }

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Student</Button>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{student.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{student.phone || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student)
                      setShowScheduleModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Add Schedule
                  </button>
                  <button
                    onClick={() => handleResetPin(student.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    Reset PIN
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No students yet. Click "Add Student" to get started.
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setError('')
        }}
        title="Add New Student"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <Input
            label="Student Name"
            value={name}
            onChange={setName}
            required
            placeholder="John Doe"
          />
          <Input
            label="Email (optional)"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="student@example.com"
          />
          <Input
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+1234567890"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" fullWidth>
              Add Student
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={`Add Schedule for ${selectedStudent?.name}`}
      >
        <form onSubmit={handleAddSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Block
            </label>
            <select
              value={selectedTimeBlock}
              onChange={(e) => setSelectedTimeBlock(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Select a time block</option>
              {timeBlocks.map((tb) => (
                <option key={tb.id} value={tb.id}>
                  {tb.name} ({tb.startTime} - {tb.endTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Recurring Schedule</span>
            </label>
          </div>

          {isRecurring ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Days
                </label>
                <div className="flex gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`
                        px-3 py-2 rounded text-sm font-medium
                        ${
                          selectedDays.includes(index)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Start Date"
                type="date"
                value={scheduleDate}
                onChange={(value) => {
                  setScheduleDate(value)
                  // Auto-set end date to 2 months from start if not already set
                  if (!recurringEndDate && value) {
                    const start = new Date(value)
                    const end = new Date(start)
                    end.setMonth(end.getMonth() + 2)
                    setRecurringEndDate(end.toISOString().split('T')[0])
                  }
                }}
                required
              />

              <Input
                label="End Date"
                type="date"
                value={recurringEndDate}
                onChange={setRecurringEndDate}
                required
                min={scheduleDate}
              />
            </>
          ) : (
            <Input
              label="Date"
              type="date"
              value={scheduleDate}
              onChange={setScheduleDate}
              required
            />
          )}

          <div className="flex gap-2">
            <Button type="submit" fullWidth>
              Add Schedule
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
