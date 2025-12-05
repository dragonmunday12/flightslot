'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid PIN')
        setLoading(false)
        return
      }

      // Redirect based on user role
      router.push(data.redirectTo)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handlePinChange = (value: string) => {
    // Only allow digits and max 4 characters
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value)
      setError('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md transition-colors">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 dark:bg-blue-500 rounded-full mb-4 transition-colors">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">FlightSlot</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Flight Instructor Scheduling</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Enter your PIN"
              type="password"
              value={pin}
              onChange={handlePinChange}
              placeholder="0000"
              maxLength={4}
              required
              error={error}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Enter your 4-digit PIN to access the system
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={pin.length !== 4 || loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Need help? Contact your flight instructor.</p>
        </div>
      </div>
    </div>
  )
}
