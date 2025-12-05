import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlightSlot - Flight Instructor Scheduling',
  description: 'Schedule and manage flight instruction times',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">{children}</body>
    </html>
  )
}
