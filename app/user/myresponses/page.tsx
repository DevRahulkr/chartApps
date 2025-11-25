'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Cookies from "js-cookie"
import { api } from '@/lib/api'

interface UserResponse {
  id: string
  form_id: string
  user_id: string
  answers: Array<{
    question_id: string
    question_text: string
    answer: string | string[]
  }>
  submitted_at: string
}

export default function MyResponsesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }
    if (user) fetchResponses()
  }, [user, loading, router])

    const token = Cookies.get("access_token")

const fetchResponses = async () => {
  try {
    const res = await api.get(`/my-responses?${selectedMonth}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = res.data
    setResponses(data)
  } catch (err) {
    toast.error('Error fetching responses')
  } finally {
    setIsLoading(false)
  }
}


  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Charts</h1>
            <p className="text-gray-600">All Charts you’ve submitted</p>
          </div>
          <Link
            href="/profile/dashboard"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* ✅ Month Filter Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="month" className="text-sm font-medium text-gray-700">
              Select Month:
            </label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={fetchResponses}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ✅ Responses List */}
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {responses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No responses found</div>
          ) : (
            responses.map((r) => <ResponseCard key={r.id} response={r} />)
          )}
        </div>
      </div>
    </div>
  )
}

function ResponseCard({ response }: { response: UserResponse }) {
  const formatAnswer = (answer: string | string[]) => (Array.isArray(answer) ? answer.join(', ') : answer)
  const dateAnswer = response.answers.find((ans) => {
    const text = (ans.question_text ?? "").toLowerCase()
    const id = (ans.question_id ?? "").toLowerCase()
    return text === "date" || text.includes("date") || id.includes("date")
  })
  const adminBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://bk-seva.onrender.com'
  return (
    <div className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
      <div>
        {/* <h3 className="text-lg font-bold text-gray-900">
          Response #{response.id.slice(-6)}
        </h3> */}
        <p className="text-sm text-gray-600">
          Submitted on {dateAnswer ? formatAnswer(dateAnswer.answer) : "N/A"}
        </p>
        {/* <div className="mt-2 space-y-1">
          {response.answers.slice(0, 2).map((ans, i) => (
            <p key={i} className="text-sm text-gray-700">
              <span className="font-medium">{ans.question_text}:</span> {formatAnswer(ans.answer)}
            </p>
          ))}
          {response.answers.length > 2 && (
            <p className="text-sm text-gray-500">+{response.answers.length - 2} more answers...</p>
          )}
        </div> */}
      </div>
        {/* ✅ Show only if month matches */}
      {/* {matchesMonth && ( */}
      
      <div className="flex items-center space-x-2">
        <Link
          href={`/user/forms/${response.form_id}/response`}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          View Full Response
        </Link>
        <Link
          href={`/user/forms/${response.form_id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}