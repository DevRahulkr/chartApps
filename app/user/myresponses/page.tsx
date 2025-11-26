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
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b08d57] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading responses...</p>
        </div>
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-[#f9f7f3] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Charts</h1>
            <p className="text-sm text-gray-600">All charts you’ve submitted</p>
          </div>
          <Link
            href="/profile/dashboard"
            className="logout-btn bg-[#b08d57] hover:bg-[#a3824d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Month Filter Section */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <label htmlFor="month" className="text-sm font-medium text-gray-700">
              Select Month
            </label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b08d57]/60 focus:border-[#b08d57]"
            />
            <button
              onClick={fetchResponses}
              className="logout-btn bg-[#b08d57] hover:bg-[#a3824d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Responses List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-100">
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
    <div className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between hover:bg-gray-50">
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
          className="logout-btn text-[#b08d57] hover:text-[#a3824d] text-sm font-medium"
        >
          View Full Response
        </Link>
        <Link
          href={`/user/forms/${response.form_id}/response/${response.id}/edit`}
          className="logout-btn text-[#b08d57] hover:text-[#a3824d] text-sm font-medium"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}