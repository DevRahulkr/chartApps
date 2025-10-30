'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthHeaders } from '@/lib/auth'
import { toast } from 'react-hot-toast'
import { api } from '@/lib/api'

interface Answer {
  question_id: string
  answer: string | string[]
}

interface QuestionAnswer {
  question_id: string
  question_text: string
  question_type: string
  answer: string | string[]
}

interface ResponseView {
  response_id?: string
  id?: string
  form_id: string
  user_id: string
  user_name?: string
  user_email?: string
  user_username?: string
  submitted_at: string
  question_answers?: QuestionAnswer[]
  answers?: Answer[]
}

interface Form {
  id: string
  title: string
  description: string
  month: string
  questions: Array<{
    id: string
    text: string
    type: string
    options?: string[]
    required: boolean
  }>
  created_at: string
}

export default function FormResponsesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const formId = params.formId as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<ResponseView[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }
    
    if (user && user.role !== 'admin') {
      toast.error('Admin access required')
      router.push('/profile')
      return
    }

    if (user && user.role === 'admin') {
      fetchFormAndResponses()
    }
  }, [user, loading, router, formId])

const fetchFormAndResponses = async () => {
  try {
    // ✅ Fetch form details
    const formRes = await api.get(`/admin/forms/${formId}`)
    if (formRes.status === 200) {
      setForm(formRes.data)
    }

    // ✅ Fetch responses
    const responsesRes = await api.get(`/admin/forms/${formId}/responses`)
    if (!responsesRes.data) {
      toast.error('No responses found')
      return
    }

    const responsesData = responsesRes.data
    console.log('Backend response data:', responsesData)

    let enhancedResponses = responsesData

    // ✅ Check if enhancement is needed
    const needsEnhancement = responsesData.some(
      (response: any) => !response.user_name || !response.question_answers
    )

    if (needsEnhancement) {
      console.warn('Enhancing old response format...')

      // ✅ Fetch users & add lookup
      const usersRes = await api.get('/admin/users')
      const usersLookup: any = usersRes.data.reduce((acc: any, user: any) => {
        acc[user.id] = user
        return acc
      }, {})

      // ✅ We already fetched form above → reuse
      const formQuestions = formRes.data?.questions || []

      enhancedResponses = responsesData.map((response: any) => {
        const user = usersLookup[response.user_id] || {}

        const questionAnswers =
          response.answers?.map((answer: any) => {
            const question = formQuestions.find((q: any) => q.id === answer.question_id)
            return {
              question_id: answer.question_id,
              question_text: question?.text || `Question #${answer.question_id}`,
              question_type: question?.type || 'text',
              answer: answer.answer
            }
          }) || []

        return {
          response_id: response.id,
          form_id: response.form_id,
          user_id: response.user_id,
          user_name: user.full_name || user.name || 'Unknown User',
          user_email: user.email || 'Unknown Email',
          user_username: user.username || 'Unknown Username',
          submitted_at: response.submitted_at,
          question_answers: questionAnswers
        }
      })
    }

    // ✅ Sort alphabetically by user
    const sortedResponses = enhancedResponses.sort((a: any, b: any) =>
      (a.user_name || '').localeCompare(b.user_name || '')
    )
    setResponses(sortedResponses)
  } catch (error) {
    console.error(error)
    toast.error('Error fetching data')
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading responses...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/admin/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Form Responses
              </h1>
              {form && (
                <p className="mt-2 text-lg text-gray-600">{form.title}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {responses.length} response{responses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Responses List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {responses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
              <p className="text-gray-500">This form hasn't received any responses yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {responses.map((response, index) => (
                <div key={response.response_id || response.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {response.user_name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Username: {response.user_username || 'Unknown'} | Email: {response.user_email || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(response.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Response #{index + 1}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {response.question_answers && response.question_answers.length > 0 ? (
                      response.question_answers.map((qa, answerIndex) => (
                        <div key={answerIndex} className="border-l-4 border-blue-200 pl-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {qa.question_text}
                          </h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                            {formatAnswer(qa.answer)}
                          </p>
                        </div>
                      ))
                    ) : response.answers && response.answers.length > 0 ? (
                      response.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="border-l-4 border-blue-200 pl-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Question ID: {answer.question_id}
                          </h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                            {formatAnswer(answer.answer)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">
                        No question-answer data available
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
