'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TimeBlock } from '@/types'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [editingTimeBlock, setEditingTimeBlock] = useState<string | null>(null)
  const [timeBlockForm, setTimeBlockForm] = useState({ name: '', startTime: '', endTime: '' })
  const [creatingTimeBlock, setCreatingTimeBlock] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchTimeBlocks()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/instructor/settings')
      const data = await res.json()
      setEmail(data.email || '')
      setPhone(data.phone || '')
    } catch (error) {
      console.error('Error fetching settings:', error)
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Validate PIN if provided
    if (newPin || confirmPin) {
      if (newPin !== confirmPin) {
        setMessage('PINs do not match')
        setSaving(false)
        return
      }
      if (!/^\d{4}$/.test(newPin)) {
        setMessage('PIN must be exactly 4 digits')
        setSaving(false)
        return
      }
    }

    try {
      const res = await fetch('/api/instructor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
          newPin: newPin || undefined,
        }),
      })

      if (res.ok) {
        setMessage('Settings saved successfully!')
        setNewPin('')
        setConfirmPin('')
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to save settings')
      }
    } catch (error) {
      setMessage('An error occurred while saving settings')
    }

    setSaving(false)
  }

  const handleUpdateTimeBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/time-blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeBlockForm),
      })

      if (res.ok) {
        fetchTimeBlocks()
        setEditingTimeBlock(null)
        setTimeBlockForm({ name: '', startTime: '', endTime: '' })
      }
    } catch (error) {
      console.error('Error updating time block:', error)
    }
  }

  const startEditTimeBlock = (tb: TimeBlock) => {
    setEditingTimeBlock(tb.id)
    setTimeBlockForm({ name: tb.name, startTime: tb.startTime, endTime: tb.endTime })
  }

  const handleCreateTimeBlock = async () => {
    try {
      const res = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: timeBlockForm.name,
          startTime: timeBlockForm.startTime,
          endTime: timeBlockForm.endTime,
          order: timeBlocks.length + 1,
        }),
      })

      if (res.ok) {
        fetchTimeBlocks()
        setCreatingTimeBlock(false)
        setTimeBlockForm({ name: '', startTime: '', endTime: '' })
      }
    } catch (error) {
      console.error('Error creating time block:', error)
    }
  }

  const handleDeleteTimeBlock = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time block? This cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/time-blocks/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchTimeBlocks()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete time block')
      }
    } catch (error) {
      console.error('Error deleting time block:', error)
      alert('Failed to delete time block')
    }
  }

  const handleClearEvents = async () => {
    const confirmed = confirm(
      'Clear All Schedules and Requests?\n\n' +
      'This will:\n' +
      '✓ Delete all schedules\n' +
      '✓ Delete all requests\n' +
      '✗ Keep blocked days\n' +
      '✗ Keep students\n' +
      '✗ Keep time blocks\n\n' +
      'This cannot be undone. Continue?'
    )

    if (!confirmed) return

    setClearing(true)
    try {
      const res = await fetch('/api/clear-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeBlockedDays: false }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(
          `Successfully cleared:\n` +
          `• ${data.schedulesDeleted} schedules\n` +
          `• ${data.requestsDeleted} requests\n` +
          `• Kept ${data.blockedDaysKept} blocked days`
        )
      } else {
        alert(data.error || 'Failed to clear events')
      }
    } catch (error) {
      console.error('Error clearing events:', error)
      alert('Failed to clear events')
    }
    setClearing(false)
  }

  const handleClearAll = async () => {
    const confirmed = confirm(
      '⚠️ CLEAR EVERYTHING?\n\n' +
      'This will:\n' +
      '✓ Delete all schedules\n' +
      '✓ Delete all requests\n' +
      '✓ Delete all blocked days\n' +
      '✗ Keep students\n' +
      '✗ Keep time blocks\n\n' +
      '⚠️ THIS CANNOT BE UNDONE! ⚠️\n\n' +
      'Are you absolutely sure?'
    )

    if (!confirmed) return

    setClearing(true)
    try {
      const res = await fetch('/api/clear-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeBlockedDays: true }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(
          `Successfully cleared:\n` +
          `• ${data.schedulesDeleted} schedules\n` +
          `• ${data.requestsDeleted} requests\n` +
          `• ${data.blockedDaysDeleted} blocked days`
        )
      } else {
        alert(data.error || 'Failed to clear all')
      }
    } catch (error) {
      console.error('Error clearing all:', error)
      alert('Failed to clear all')
    }
    setClearing(false)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-900 dark:text-white">Loading...</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.5rem' }}>Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }} className="lg:grid-cols-2">
        {/* Contact Information */}
        <div style={{ backgroundColor: '#2d3748', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Contact Information</h2>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="your.email@example.com"
              />
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Used for receiving request notifications
              </p>
            </div>

            <div>
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+1234567890"
              />
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Used for SMS notifications about new requests
              </p>
            </div>

            {message && (
              <div style={{
                fontSize: '0.875rem',
                color: message.includes('success') ? '#16a34a' : '#dc2626'
              }}>
                {message}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Contact Info'}
            </Button>
          </form>
        </div>

        {/* Change PIN */}
        <div style={{ backgroundColor: '#2d3748', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Change PIN</h2>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <Input
                label="New PIN"
                type="password"
                value={newPin}
                onChange={setNewPin}
                placeholder="0000"
                maxLength={4}
              />
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>Enter a new 4-digit PIN</p>
            </div>

            <Input
              label="Confirm PIN"
              type="password"
              value={confirmPin}
              onChange={setConfirmPin}
              placeholder="0000"
              maxLength={4}
            />

            <Button type="submit" disabled={saving || !newPin || !confirmPin}>
              {saving ? 'Updating...' : 'Update PIN'}
            </Button>
          </form>
        </div>

        {/* Time Blocks Configuration */}
        <div style={{ backgroundColor: '#2d3748', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', padding: '1.5rem' }} className="lg:col-span-2">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Time Blocks</h2>
          <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '1rem' }}>
            Configure your daily time blocks. Changes will automatically update existing schedules.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Create New Time Block Button/Form */}
            {creatingTimeBlock ? (
              <div style={{ border: '2px solid #3b82f6', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#1e3a5f' }}>
                <h3 style={{ fontWeight: '600', color: '#93c5fd', marginBottom: '0.75rem' }}>New Time Block</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Input
                    label="Name"
                    value={timeBlockForm.name}
                    onChange={(val) => setTimeBlockForm({ ...timeBlockForm, name: val })}
                    placeholder="e.g., Morning, Afternoon"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <Input
                      label="Start Time"
                      type="time"
                      value={timeBlockForm.startTime}
                      onChange={(val) => setTimeBlockForm({ ...timeBlockForm, startTime: val })}
                    />
                    <Input
                      label="End Time"
                      type="time"
                      value={timeBlockForm.endTime}
                      onChange={(val) => setTimeBlockForm({ ...timeBlockForm, endTime: val })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      onClick={handleCreateTimeBlock}
                      variant="success"
                      disabled={!timeBlockForm.name || !timeBlockForm.startTime || !timeBlockForm.endTime}
                    >
                      Create
                    </Button>
                    <Button
                      onClick={() => {
                        setCreatingTimeBlock(false)
                        setTimeBlockForm({ name: '', startTime: '', endTime: '' })
                      }}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreatingTimeBlock(true)}
                style={{
                  border: '2px dashed #3b82f6',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                  e.currentTarget.style.borderColor = '#60a5fa'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = '#3b82f6'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>+</span>
                Add New Time Block
              </button>
            )}

            {timeBlocks.map((tb) => (
              <div key={tb.id} style={{ border: '1px solid #4a5568', borderRadius: '0.5rem', padding: '1rem' }}>
                {editingTimeBlock === tb.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Input
                      label="Name"
                      value={timeBlockForm.name}
                      onChange={(val) => setTimeBlockForm({ ...timeBlockForm, name: val })}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      <Input
                        label="Start Time"
                        type="time"
                        value={timeBlockForm.startTime}
                        onChange={(val) => setTimeBlockForm({ ...timeBlockForm, startTime: val })}
                      />
                      <Input
                        label="End Time"
                        type="time"
                        value={timeBlockForm.endTime}
                        onChange={(val) => setTimeBlockForm({ ...timeBlockForm, endTime: val })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button onClick={() => handleUpdateTimeBlock(tb.id)} variant="success">
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingTimeBlock(null)
                          setTimeBlockForm({ name: '', startTime: '', endTime: '' })
                        }}
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#ffffff' }}>{tb.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                        {tb.startTime} - {tb.endTime}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button onClick={() => startEditTimeBlock(tb)} variant="secondary">
                        Edit
                      </Button>
                      <Button onClick={() => handleDeleteTimeBlock(tb.id)} variant="danger">
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Database Management */}
        <div style={{ backgroundColor: '#2d3748', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', padding: '1.5rem' }} className="lg:col-span-2">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.75rem' }}>Database Management</h2>
          <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '1rem' }}>
            Clear schedules and requests from the database. Students, time blocks, and settings are never deleted.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="md:grid-cols-2">
            {/* Clear Events (Keep Blocked Days) */}
            <div style={{ border: '1px solid #f59e0b', borderRadius: '0.5rem', padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
              <h3 style={{ fontWeight: '600', color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>Clear Events</h3>
              <div style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                <div style={{ marginBottom: '0.25rem' }}>Clears:</div>
                <div style={{ paddingLeft: '1rem' }}>
                  <div>✓ All schedules</div>
                  <div>✓ All requests</div>
                </div>
                <div style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>Keeps:</div>
                <div style={{ paddingLeft: '1rem' }}>
                  <div>• Blocked days</div>
                  <div>• Students</div>
                  <div>• Time blocks</div>
                </div>
              </div>
              <Button
                onClick={handleClearEvents}
                disabled={clearing}
                variant="warning"
                fullWidth
              >
                {clearing ? 'Clearing...' : 'Clear Events'}
              </Button>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Use when starting a new semester but keeping vacation days
              </p>
            </div>

            {/* Clear All (Including Blocked Days) */}
            <div style={{ border: '1px solid #dc2626', borderRadius: '0.5rem', padding: '1rem', backgroundColor: 'rgba(220, 38, 38, 0.05)' }}>
              <h3 style={{ fontWeight: '600', color: '#f87171', marginBottom: '0.5rem', fontSize: '1rem' }}>Clear Everything</h3>
              <div style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                <div style={{ marginBottom: '0.25rem' }}>Clears:</div>
                <div style={{ paddingLeft: '1rem' }}>
                  <div>✓ All schedules</div>
                  <div>✓ All requests</div>
                  <div>✓ All blocked days</div>
                </div>
                <div style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>Keeps:</div>
                <div style={{ paddingLeft: '1rem' }}>
                  <div>• Students</div>
                  <div>• Time blocks</div>
                </div>
              </div>
              <Button
                onClick={handleClearAll}
                disabled={clearing}
                variant="danger"
                fullWidth
              >
                {clearing ? 'Clearing...' : 'Clear Everything'}
              </Button>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Use for a complete fresh start
              </p>
            </div>
          </div>
        </div>

        {/* API Keys Setup Instructions */}
        <div style={{ backgroundColor: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: '0.5rem', padding: '1.5rem' }} className="lg:col-span-2">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#93c5fd', marginBottom: '0.75rem' }}>Notification Setup</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#bfdbfe' }}>
            <p>
              <strong>Email (Resend):</strong> To enable email notifications, add your Resend API key
              to the .env.local file. Get your key at{' '}
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline' }}
              >
                resend.com
              </a>
            </p>
            <p>
              <strong>SMS (Twilio):</strong> To enable SMS notifications, add your Twilio credentials
              to the .env.local file. Get them at{' '}
              <a
                href="https://www.twilio.com/console"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline' }}
              >
                twilio.com/console
              </a>
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#93c5fd' }}>
              After adding API keys, restart the development server for changes to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
