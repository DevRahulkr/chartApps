'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAuthHeaders } from '@/lib/auth'

interface Question {
  id: string
  type: string
  text: string
  required: boolean
  options?: { id: string; text: string }[]
  placeholder?: string
}

interface Form {
  id: string
  title: string
  description: string
  month: string
  questions: Question[]
  is_active: boolean
  created_at: string
}

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

type AnswerState = Record<string, string>

export default function EditUserResponse({ params }: { params: { formId: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [response, setResponse] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // local editable answers: key = question_id, value = string
  const [answersState, setAnswersState] = useState<AnswerState>({})

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://bk-seva.onrender.com'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      fetchFormAndResponse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router, params.formId])

  const fetchFormAndResponse = async () => {
    try {
      // 1️⃣ Fetch form details
      const formResponse = await fetch(`${API_BASE}/forms/${params.formId}`, {
        headers: getAuthHeaders(),
      })

      if (!formResponse.ok) {
        toast.error('Failed to fetch form')
        router.push('/profile/dashboard')
        return
      }

      const formData: Form = await formResponse.json()
      setForm(formData)

      // 2️⃣ Fetch user's response
      const responseResponse = await fetch(
        `${API_BASE}/forms/${params.formId}/my-response`,
        {
          headers: getAuthHeaders(),
        }
      )

      if (!responseResponse.ok) {
        toast.error('No response found for this form')
        router.push('/profile/dashboard')
        return
      }

      const responseData: UserResponse = await responseResponse.json()
      setResponse(responseData)

      // 3️⃣ Initialize editable answers state (question_id -> string)
      const initialAnswers: AnswerState = {}
      responseData.answers.forEach((a) => {
        initialAnswers[a.question_id] = Array.isArray(a.answer)
          ? a.answer.join(', ')
          : a.answer
      })
      setAnswersState(initialAnswers)
    } catch (error) {
      toast.error('Error fetching data')
      router.push('/profile/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // 🟢 Submit: PUT /forms/{form_id}/responses/{response_id}
  const handleUpdateResponse = async () => {
    if (!form || !response) return

    try {
      const payload = {
        form_id: form.id,
        answers: form.questions.map((q) => ({
          question_id: q.id,
          question_text: q.text,
          answer: answersState[q.id] ?? '', // always send string
        })),
      }

      const res = await fetch(
        `${API_BASE}/forms/${form.id}/responses/${response.id}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail || 'Failed to update response')
      }

      toast.success('Response updated successfully!')
      router.push('/user/myresponses')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update response')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading response...</p>
        </div>
      </div>
    )
  }

  if (!user || !form || !response) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Your Response</h1>
              <p className="text-gray-600">{form.title}</p>
              <p className="text-sm text-gray-500">
                Last submitted on {new Date(response.submitted_at).toLocaleString()}
              </p>
            </div>
            <Link
              href="/profile/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Form Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Title:</span>
              <span className="ml-2 text-gray-900">{form.title}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Month:</span>
              <span className="ml-2 text-gray-900">{form.month}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Description:</span>
              <span className="ml-2 text-gray-900">{form.description}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Your Answers</h2>

          {form.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {index + 1}. {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
              </div>

              <div>
                <input
                  type="text"
                  value={answersState[question.id] ?? ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter your answer"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <Link
            href="/user/myresponses"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleUpdateResponse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Update Response
          </button>
        </div>
      </div>
    </div>
  )
}