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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="your.email@example.com"
            />
            <p className="text-sm text-gray-500 -mt-2">
              Used for receiving request notifications
            </p>

            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+1234567890"
            />
            <p className="text-sm text-gray-500 -mt-2">
              Used for SMS notifications about new requests
            </p>

            {message && (
              <div
                className={`text-sm ${
                  message.includes('success') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Contact Info'}
            </Button>
          </form>
        </div>

        {/* Change PIN */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change PIN</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <Input
              label="New PIN"
              type="password"
              value={newPin}
              onChange={setNewPin}
              placeholder="0000"
              maxLength={4}
            />
            <p className="text-sm text-gray-500 -mt-2">Enter a new 4-digit PIN</p>

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
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Time Blocks</h2>
          <p className="text-sm text-gray-600 mb-4">
            Configure your daily time blocks. Changes will automatically update existing schedules.
          </p>

          <div className="space-y-3">
            {timeBlocks.map((tb) => (
              <div key={tb.id} className="border rounded-lg p-4">
                {editingTimeBlock === tb.id ? (
                  <div className="space-y-3">
                    <Input
                      label="Name"
                      value={timeBlockForm.name}
                      onChange={(val) => setTimeBlockForm({ ...timeBlockForm, name: val })}
                    />
                    <div className="grid grid-cols-2 gap-3">
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
                    <div className="flex gap-2">
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tb.name}</h3>
                      <p className="text-sm text-gray-600">
                        {tb.startTime} - {tb.endTime}
                      </p>
                    </div>
                    <Button onClick={() => startEditTimeBlock(tb)} variant="secondary">
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* API Keys Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Notification Setup</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Email (Resend):</strong> To enable email notifications, add your Resend API key
              to the .env.local file. Get your key at{' '}
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
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
                className="underline"
              >
                twilio.com/console
              </a>
            </p>
            <p className="text-xs mt-2">
              After adding API keys, restart the development server for changes to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
