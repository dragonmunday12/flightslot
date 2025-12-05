'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">FlightSlot</span>
              </div>

              {/* Nav Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                        transition-colors duration-200
                        ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side - Instructor badge & logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full transition-colors">
                Instructor
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="sm:hidden pb-3 pt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 text-base font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
