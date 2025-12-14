'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { Student, TimeBlock } from '@/types'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinModalTitle, setPinModalTitle] = useState('')

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
      setPinModalTitle(`Student Added: ${name}`)
      setShowPinModal(true)
      fetchStudents()
      setName('')
      setEmail('')
      setPhone('')
      setShowAddModal(false)
    } catch (error) {
      setError('An error occurred while adding the student')
    }
  }

  const handleDeleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchStudents()
      }
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const handleResetPin = async (id: string, studentName: string) => {
    const confirmed = window.confirm(
      `This will generate a NEW PIN for ${studentName}.\n\n` +
      `The old PIN will no longer work.\n\n` +
      `Do you want to continue?`
    )

    if (!confirmed) return

    try {
      const res = await fetch(`/api/students/${id}/reset-pin`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setNewPin(data.pin)
        setPinModalTitle(`PIN Reset: ${studentName}`)
        setShowPinModal(true)
        fetchStudents()
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
        // Validate selected days
        if (selectedDays.length === 0) {
          alert('Please select at least one day of the week')
          return
        }

        // Validate end date is provided
        if (!recurringEndDate) {
          alert('Please select an end date for the recurring schedule')
          return
        }

        // Validate end date is after start date
        if (new Date(recurringEndDate) < new Date(scheduleDate)) {
          alert('End date must be after start date')
          return
        }

        payload.recurring = {
          days: selectedDays,
          startDate: scheduleDate,
          endDate: recurringEndDate,
        }

        console.log('Recurring schedule data:', {
          startDate: scheduleDate,
          endDate: recurringEndDate,
          days: selectedDays,
          dayNames: selectedDays.map(d => dayNames[d])
        })
      } else {
        payload.dates = [scheduleDate]
      }

      console.log('Sending schedule request:', JSON.stringify(payload, null, 2))

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Schedule created successfully:', data)
        setShowScheduleModal(false)
        setScheduleDate('')
        setSelectedTimeBlock('')
        setIsRecurring(false)
        setSelectedDays([])
        setRecurringEndDate('')
      } else {
        const errorData = await res.json()
        console.error('API Error:', errorData)
        alert(`Error: ${errorData.error || 'Failed to create schedule'}`)
      }
    } catch (error) {
      console.error('Error adding schedule:', error)
      alert('Network error - check console for details')
    }
  }

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#f3f4f6' }}>Students</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Student</Button>
      </div>

      {/* Students List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {students.map((student) => (
          <div
            key={student.id}
            style={{
              backgroundColor: '#2d3748',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              border: '1px solid #4a5568'
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f3f4f6', marginBottom: '0.5rem' }}>
                {student.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', color: '#d1d5db' }}>
                <div>
                  <span style={{ color: '#9ca3af', fontWeight: '500' }}>Email:</span> {student.email || '-'}
                </div>
                <div>
                  <span style={{ color: '#9ca3af', fontWeight: '500' }}>Phone:</span> {student.phone || '-'}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              borderTop: '1px solid #4a5568',
              paddingTop: '0.75rem'
            }}>
              <button
                onClick={() => {
                  setSelectedStudent(student)
                  setShowScheduleModal(true)
                }}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s',
                  flex: '1',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Add Schedule
              </button>
              <button
                onClick={() => handleResetPin(student.id, student.name)}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s',
                  flex: '1',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                Reset PIN
              </button>
              <button
                onClick={() => handleDeleteStudent(student.id)}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s',
                  flex: '1',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div style={{
            backgroundColor: '#2d3748',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            padding: '3rem',
            color: '#9ca3af'
          }}>
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
          <PhoneInput
            label="Phone (optional)"
            value={phone}
            onChange={setPhone}
            placeholder="5551234567"
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

      {/* PIN Display Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false)
          setNewPin('')
        }}
        title={pinModalTitle}
      >
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
            Save this PIN securely. It cannot be retrieved later.
          </p>
          <div style={{
            backgroundColor: '#1f2937',
            border: '2px solid #60a5fa',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Student PIN
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#60a5fa',
              fontFamily: 'monospace',
              letterSpacing: '0.5rem'
            }}>
              {newPin}
            </div>
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(newPin)
              alert('PIN copied to clipboard!')
            }}
            fullWidth
          >
            Copy PIN to Clipboard
          </Button>
        </div>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false)
          setScheduleDate('')
          setSelectedTimeBlock('')
          setIsRecurring(false)
          setSelectedDays([])
          setRecurringEndDate('')
        }}
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', marginBottom: '0.5rem' }}>
                  Select Days
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {dayNames.map((day, index) => {
                    const isSelected = selectedDays.includes(index)
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayToggle(index)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: isSelected ? '#3b82f6' : '#4b5563',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#6b7280'
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#4b5563'
                          }
                        }}
                      >
                        {day}
                      </button>
                    )
                  })}
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
              onClick={() => {
                setShowScheduleModal(false)
                setScheduleDate('')
                setSelectedTimeBlock('')
                setIsRecurring(false)
                setSelectedDays([])
                setRecurringEndDate('')
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
