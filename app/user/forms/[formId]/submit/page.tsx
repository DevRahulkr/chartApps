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

interface Answer {
  question_id: string
  answer: string | string[]
}

export default function SubmitForm({ params }: { params: { formId: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answers, setAnswers] = useState<{ [questionId: string]: string | string[] }>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      fetchForm()
    }
  }, [user, loading, router, params.formId])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.formId}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      } else {
        toast.error('Failed to fetch form')
        router.push('/profile/dashboard')
      }
    } catch (error) {
      toast.error('Error fetching form')
      router.push('/profile/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form) return

    // Validate required questions
    const requiredQuestions = form.questions.filter(q => q.required)
    for (const question of requiredQuestions) {
      if (
        !answers[question.id] ||
        (typeof answers[question.id] === 'string' && (answers[question.id] as string).trim() === '') ||
        (Array.isArray(answers[question.id]) && (answers[question.id] as string[]).length === 0)
      ) {
        toast.error(`Please answer the required question: ${question.text}`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Convert option IDs to text for radio, checkbox, and multiple_choice questions
      const processedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = form.questions.find(q => q.id === questionId)
        
        if (question && ['radio', 'checkbox', 'multiple_choice'].includes(question.type) && question.options) {
          if (Array.isArray(answer)) {
            // Handle checkbox (multiple selections)
            const textAnswers = answer.map(optionId => {
              const option = question.options?.find(opt => opt.id === optionId)
              return option ? option.text : optionId
            })
            return {
              question_id: questionId,
              answer: textAnswers
            }
          } else {
            // Handle radio and multiple_choice (single selection)
            const option = question.options?.find(opt => opt.id === answer)
            return {
              question_id: questionId,
              answer: option ? option.text : answer
            }
          }
        }
        
        // For other question types, keep the answer as-is
        return {
          question_id: questionId,
          answer: answer
        }
      })

      const responseData = {
        form_id: params.formId,
        answers: processedAnswers
      }

      const response = await fetch(`/api/forms/${params.formId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(responseData)
      })

      if (response.ok) {
        toast.success('Form submitted successfully!')
        router.push('/profile/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to submit form')
      }
    } catch (error) {
      toast.error('Error submitting form')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!user || !form) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
              <p className="text-gray-600">{form.description}</p>
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
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form...</p>
          </div>
        ) : !form ? (
          <div className="text-center py-8">
            <p className="text-red-600">Form not found</p>
          </div>
        ) : !form.questions || form.questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-red-600">Form has no questions</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {form.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <label className="block text-lg font-bold text-gray-900">
                  {index + 1}. {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>

              <div className="space-y-4">
                {question.type === 'text' && (
                  <input
                    type="text"
                    value={answers[question.id] as string || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Enter your answer'}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    required={question.required}
                  />
                )}

                {question.type === 'textarea' && (
                  <textarea
                    value={answers[question.id] as string || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Enter your answer'}
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    required={question.required}
                  />
                )}

                {question.type === 'number' && (
                  <input
                    type="number"
                    value={answers[question.id] as string || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Enter a number'}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    required={question.required}
                  />
                )}

                {question.type === 'date' && (
                  <input
                    type="date"
                    value={answers[question.id] as string || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    required={question.required}
                  />
                )}

                {['multiple_choice', 'radio'].includes(question.type) && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          required={question.required}
                        />
                        <span className="ml-2 text-sm text-gray-900">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'checkbox' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          value={option.id}
                          checked={(answers[question.id] as string[] || []).includes(option.id)}
                          onChange={(e) => {
                            const currentAnswers = answers[question.id] as string[] || []
                            if (e.target.checked) {
                              handleAnswerChange(question.id, [...currentAnswers, option.id])
                            } else {
                              handleAnswerChange(question.id, currentAnswers.filter(id => id !== option.id))
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/profile/dashboard"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
