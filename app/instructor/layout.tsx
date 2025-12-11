'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navItems = [
    { href: '/instructor', label: 'Calendar', icon: '📅' },
    { href: '/instructor/students', label: 'Students', icon: '👥' },
    { href: '/instructor/requests', label: 'Requests', icon: '📝' },
    { href: '/instructor/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; align-items: center; gap: 0.5rem; }
          .mobile-menu-button { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-button { display: flex !important; }
        }
      `}</style>
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

            {/* Desktop Nav Links - Hidden on mobile, flex on large screens */}
            <div className="desktop-nav" style={{ display: 'none' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                        color: isActive ? '#93c5fd' : '#9ca3af',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#374151'
                          e.currentTarget.style.color = '#d1d5db'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = '#9ca3af'
                        }
                      }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {/* Right side - Instructor badge & logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#d1d5db',
                  backgroundColor: '#374151',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  fontWeight: '500'
                }}>
                  Instructor
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                color: '#d1d5db',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '0.375rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-menu" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              paddingBottom: '1rem',
              borderTop: '1px solid #334155',
              marginTop: '0.5rem',
              paddingTop: '0.5rem'
            }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                      color: isActive ? '#93c5fd' : '#9ca3af',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}

              <div style={{
                borderTop: '1px solid #334155',
                marginTop: '0.5rem',
                paddingTop: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#d1d5db',
                  backgroundColor: '#374151',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  Instructor
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: '0.875rem',
                    color: '#ef4444',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    border: '1px solid #ef4444',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
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
