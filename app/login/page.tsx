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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
      <div style={{
        position: 'relative',
        backgroundColor: '#1e293b',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '28rem',
        border: '1px solid #334155'
      }}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* Icon */}
          <div style={{
            display: 'inline-block',
            padding: '1rem',
            backgroundColor: '#3b82f6',
            borderRadius: '1rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
          }}>
            <svg
              style={{ width: '4rem', height: '4rem', color: '#ffffff' }}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 18v-6a9 9 0 0118 0v6"></path>
              <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"></path>
            </svg>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem' }}>
            FlightSlot
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem', fontWeight: '500' }}>
            Event Scheduling Platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.75rem', textAlign: 'center' }}>
              Enter Your 4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="••••"
              maxLength={4}
              required
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                paddingLeft: 'calc(50% - 3.5rem)',
                textAlign: 'left',
                fontSize: '2rem',
                letterSpacing: '0.75rem',
                fontWeight: '700',
                border: '2px solid #4b5563',
                borderRadius: '0.75rem',
                outline: 'none',
                backgroundColor: '#374151',
                color: '#ffffff',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4b5563'
                e.target.style.boxShadow = 'none'
              }}
            />
            {error && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #dc2626',
                borderRadius: '0.5rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#ef4444', textAlign: 'center', fontWeight: '500' }}>{error}</p>
              </div>
            )}
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'center' }}>
              Instructors and students use their unique PIN
            </p>
          </div>

          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            style={{
              width: '100%',
              backgroundColor: pin.length !== 4 || loading ? '#6b7280' : '#3b82f6',
              color: '#ffffff',
              fontWeight: '600',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: pin.length !== 4 || loading ? 'not-allowed' : 'pointer',
              boxShadow: pin.length !== 4 || loading ? 'none' : '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => {
              if (pin.length === 4 && !loading) {
                e.currentTarget.style.backgroundColor = '#2563eb'
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseOut={(e) => {
              if (pin.length === 4 && !loading) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {loading ? 'Logging in...' : 'Access FlightSlot'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #334155' }}>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
            Need assistance?{' '}
            <span style={{ fontWeight: '600', color: '#3b82f6' }}>Contact your instructor</span>
          </p>
        </div>
      </div>
    </div>
  )
}
