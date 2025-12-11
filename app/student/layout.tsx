'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userName, setUserName] = useState('Student')

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.name) {
          setUserName(data.name)
        }
      } catch (error) {
        console.error('Failed to fetch user name:', error)
      }
    }
    fetchUserName()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
              </svg>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>FlightSlot</span>
            </div>

            {/* Right side - Student badge & logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#d1d5db',
                backgroundColor: '#374151',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                {userName}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  fontWeight: '500',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#7f1d1d'
                  e.currentTarget.style.color = '#fca5a5'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#ef4444'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 4rem)'
      }}>
        {children}
      </main>
    </div>
  )
}
