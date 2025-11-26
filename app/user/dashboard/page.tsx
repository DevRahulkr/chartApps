'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAuthHeaders } from '@/lib/auth'
import { api } from '@/lib/api'

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

interface Question {
  id: string
  type: string
  text: string
  required: boolean
  options?: { id: string; text: string }[]
  placeholder?: string
}

export default function UserDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [userResponses, setUserResponses] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [activeTab, setActiveTab] = useState<'forms' | 'responses'>('forms')
  const hasFetchedRef = useRef(false)
  const lastSelectedMonthRef = useRef(selectedMonth)

  // Initial data loading effect
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchForms()
      fetchUserResponses()
    }
  }, [user, loading, router])

  // Month change effect (only fetch forms, not responses)
  useEffect(() => {
    if (user && lastSelectedMonthRef.current !== selectedMonth) {
      lastSelectedMonthRef.current = selectedMonth
      fetchForms()
    }
  }, [selectedMonth, user])

const fetchForms = async () => {
  try {
    const res = await api.get(`/api/forms/month/${selectedMonth}`)
    setForms(res.data)
  } catch (err) {
    toast.error('Failed to fetch forms')
  } finally {
    setIsLoading(false)
  }
}

const fetchUserResponses = async () => {
  try {
    const res = await api.get(`/api/my-responses`)
    setUserResponses(res.data)
  } catch (err) {
    toast.error('Failed to fetch responses')
  }
}



  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                View and submit available charts, see your responses
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/profile/dashboard"
                className="w-full sm:w-auto logout-btn btn-back"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('forms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Forms 
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'responses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Responses ({userResponses.length})
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'forms' ? (
          <>
            {/* Month Selector */}
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
                  onClick={fetchForms}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Forms List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Forms for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </h2>
              </div>
              
              {forms.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No forms available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No forms are available for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {forms.map((form) => (
                    <FormCard key={form.id} form={form} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* My Responses Tab */
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">My Submitted Charts</h2>
              <p className="text-sm text-gray-500">View all your submitted form charts</p>
            </div>
            
            {userResponses.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No responses yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You have not submitted any forms yet. Go to the Available Forms tab to submit forms.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {userResponses.map((response) => (
                  <UserResponseCard key={response.id} response={response} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FormCard({ form }: { form: Form }) {
  const [hasSubmitted, setHasSubmitted] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Prevent duplicate calls using state
    if (hasChecked) return

    const checkSubmission = async () => {
      try {
        setHasChecked(true)
        
        // Create abort controller for this request
        abortControllerRef.current = new AbortController()
        
        const token = localStorage.getItem('access_token') || document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1]
        const response = await fetch(`/api/forms/${form.id}/check`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current.signal
        })
        
        if (response.ok) {
          const data = await response.json()
          setHasSubmitted(data.has_submitted)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error checking submission:', error)
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkSubmission()

    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [form.id, hasChecked])

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold text-gray-900">{form.title}</h3>
            {isChecking ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Checking...
              </span>
            ) : hasSubmitted ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Submitted
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Available
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-800 font-medium">{form.description}</p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-700 font-medium">
            <span className="bg-gray-100 px-2 py-1 rounded">Questions: {form.questions.length}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Created: {new Date(form.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasSubmitted ? (
            <Link
              href={`/user/forms/${form.id}/response`}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              View Response
            </Link>
          ) : (
            <Link
              href={`/user/forms/${form.id}/submit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Submit Form
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function UserResponseCard({ response }: { response: UserResponse }) {
  const formatAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ')
    }
    return answer
  }

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold text-gray-900">Response #{response.id.slice(-6)}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Submitted
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Submitted on {new Date(response.submitted_at).toLocaleString()}
          </p>
          <div className="mt-3 space-y-2">
            {response.answers.slice(0, 2).map((answer, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-gray-700">{answer.question_text}:</span>
                <span className="ml-2 text-gray-600">{formatAnswer(answer.answer)}</span>
              </div>
            ))}
            {response.answers.length > 2 && (
              <p className="text-sm text-gray-500">+{response.answers.length - 2} more answers...</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/user/forms/${response.form_id}/response`}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View Full Response
          </Link>
        </div>
      </div>
    </div>
  )
}
