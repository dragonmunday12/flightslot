'use client'

import { useEffect, useState } from 'react'
import { formatDateForDisplay } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { RequestWithRelations } from '@/types'

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests')
      const data = await res.json()
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
    setLoading(false)
  }

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/approve`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        alert('Request approved! Schedule has been added.')
        fetchRequests()
      } else {
        alert(data.error || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('An error occurred')
    }
  }

  const handleDeny = async (requestId: string) => {
    if (!confirm('Are you sure you want to deny this request?')) return

    try {
      const res = await fetch(`/api/requests/${requestId}/deny`, { method: 'POST' })

      if (res.ok) {
        alert('Request denied')
        fetchRequests()
      }
    } catch (error) {
      console.error('Error denying request:', error)
      alert('An error occurred')
    }
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const processedRequests = requests.filter((r) => r.status !== 'pending')

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
          Schedule Requests
        </h1>
        <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
          Review and approve student requests for time slots
        </p>
      </div>

      {/* Pending Requests */}
      <div className="mb-8">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>
          Pending Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div style={{ backgroundColor: '#2d3748', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            No pending requests
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  backgroundColor: '#2d3748',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  transition: 'box-shadow 0.2s'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff' }}>
                        {request.student.name}
                      </h3>
                      <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.875rem', borderRadius: '9999px' }}>
                        Pending
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                      <p style={{ marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#ffffff' }}>Date:</strong> {formatDateForDisplay(request.date)}
                      </p>
                      <p style={{ marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#ffffff' }}>Time:</strong> {request.timeBlock.name} (
                        {request.timeBlock.startTime} - {request.timeBlock.endTime})
                      </p>
                      {request.message && (
                        <p style={{ marginBottom: '0.25rem' }}>
                          <strong style={{ color: '#ffffff' }}>Message:</strong> {request.message}
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        Requested {formatDateForDisplay(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      variant="success"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleDeny(request.id)}
                      variant="danger"
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>
            Processed Requests ({processedRequests.length})
          </h2>

          <div style={{ backgroundColor: '#2d3748', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
            <table className="min-w-full divide-y divide-gray-200" style={{ width: '100%' }}>
              <thead style={{ backgroundColor: '#374151' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Student
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Date
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Time
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#2d3748' }}>
                {processedRequests.map((request, index) => (
                  <tr key={request.id} style={{ borderTop: index > 0 ? '1px solid #4a5568' : 'none' }}>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>
                        {request.student.name}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                        {formatDateForDisplay(request.date)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                        {request.timeBlock.name}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          borderRadius: '9999px',
                          backgroundColor: request.status === 'approved' ? '#d1fae5' : '#fee2e2',
                          color: request.status === 'approved' ? '#065f46' : '#991b1b'
                        }}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
