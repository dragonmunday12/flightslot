'use client'

import { useEffect, useState } from 'react'
import { formatDateForDisplay } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
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
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and approve student requests for time slots
        </p>
      </div>

      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Pending Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No pending requests
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.student.name}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Date:</strong> {formatDateForDisplay(request.date)}
                      </p>
                      <p>
                        <strong>Time:</strong> {request.timeBlock.name} (
                        {request.timeBlock.startTime} - {request.timeBlock.endTime})
                      </p>
                      {request.message && (
                        <p>
                          <strong>Message:</strong> {request.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Processed Requests ({processedRequests.length})
          </h2>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDateForDisplay(request.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {request.timeBlock.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`
                          px-3 py-1 text-sm rounded-full
                          ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        `}
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
