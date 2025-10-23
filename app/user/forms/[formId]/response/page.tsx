'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAuthHeaders } from '@/lib/auth'

interface Form {
  id: string
  title: string
  description: string
  month: string
  questions: Question[]
  is_active: boolean
  created_at: string
}

interface Question {
  id: string
  type: string
  text: string
  required: boolean
  options?: { id: string; text: string }[]
  placeholder?: string
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

export default function ViewResponse({ params }: { params: { formId: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [response, setResponse] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      fetchFormAndResponse()
    }
  }, [user, loading, router, params.formId])

  const fetchFormAndResponse = async () => {
    try {
      // Fetch form details
      const formResponse = await fetch(`/api/forms/${params.formId}`, {
        headers: getAuthHeaders()
      })
      
      if (formResponse.ok) {
        const formData = await formResponse.json()
        setForm(formData)
      } else {
        toast.error('Failed to fetch form')
        router.push('/profile/dashboard')
        return
      }

      // Fetch user's response
      const responseResponse = await fetch(`/api/forms/${params.formId}/my-response`, {
        headers: getAuthHeaders()
      })
      
      if (responseResponse.ok) {
        const responseData = await responseResponse.json()
        setResponse(responseData)
      } else {
        toast.error('No response found for this form')
        router.push('/profile/dashboard')
        return
      }
    } catch (error) {
      toast.error('Error fetching data')
      router.push('/profile/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const formatAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ')
    }
    return answer
  }

  const getAnswerForQuestion = (questionId: string) => {
    if (!response) return null
    const answer = response.answers.find(a => a.question_id === questionId)
    return answer ? formatAnswer(answer.answer) : 'No answer provided'
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
              <h1 className="text-3xl font-bold text-gray-900">Your Response</h1>
              <p className="text-gray-600">{form.title}</p>
              <p className="text-sm text-gray-500">
                Submitted on {new Date(response.submitted_at).toLocaleString()}
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
            <div>
              <span className="font-medium text-gray-700">Description:</span>
              <span className="ml-2 text-gray-900">{form.description}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Submitted:</span>
              <span className="ml-2 text-gray-900">{new Date(response.submitted_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Your Answers</h2>
          
          {form.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {index + 1}. {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 font-medium">
                  {getAnswerForQuestion(question.id)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <Link
            href="/profile/dashboard"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
