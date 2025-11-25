'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getAuthHeaders } from '@/lib/auth'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

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

export default function EditForm() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const formId = params.formId as string
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    month: '',
    chart_start_date: '',
    chart_end_date: '',
    validity_start_date: '',
    validity_end_date: '',
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [originalForm, setOriginalForm] = useState<Form | null>(null)
  const hasFetchedRef = useRef(false)

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

    if (user && user.role === 'admin' && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchForm()
    }
  }, [user, loading, router, formId])

const fetchForm = async () => {
  try {
    const res = await api.get(`/admin/forms/${formId}`)

    const form = res.data
    setOriginalForm(form)

    setFormData({
      title: form.title,
      description: form.description,
      month: form.month,
      chart_start_date: form.chart_start_date || '',
      chart_end_date: form.chart_end_date || '',
      validity_start_date: form.validity_start_date || '',
      validity_end_date: form.validity_end_date || ''
    })

    setQuestions(form.questions || [])
    
  } catch (error) {
    toast.error('Failed to load form')
    router.push('/admin/dashboard')
  } finally {
    setIsLoading(false)
  }
}


  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: 'text',
      text: '',
      required: false
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId))
    }
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOption = {
          id: `opt${Date.now()}`,
          text: ''
        }
        return {
          ...q,
          options: [...(q.options || []), newOption]
        }
      }
      return q
    }))
  }

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: (q.options || []).filter(opt => opt.id !== optionId)
        }
      }
      return q
    }))
  }

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: (q.options || []).map(opt => 
            opt.id === optionId ? { ...opt, text } : opt
          )
        }
      }
      return q
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        questions: questions.filter(q => q.text.trim() !== '')
      }

      const response = await api.put(`/admin/forms/${formId}`, payload)

      toast.success('Form updated successfully!')
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/admin/forms/${formId}`)
      toast.success('Form deleted successfully!')
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to delete form')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to edit forms.</p>
          <Link href="/profile/dashboard" className="text-blue-600 hover:text-blue-800">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Form</h1>
                <p className="mt-2 text-gray-600">Update form details and questions</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete Form
                </button>
                <Link
                  href="/admin/dashboard"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Form Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter form title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Chart Start Date
  </label>
  <input
    type="date"
    value={formData.chart_start_date}
    onChange={(e) =>
      setFormData({ ...formData, chart_start_date: e.target.value })
    }
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart End Date
                </label>
                <input
                  type="date"
                  value={formData.chart_end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, chart_end_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validity Start Date
                </label>
                <input
                  type="date"
                  value={formData.validity_start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, validity_start_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validity End Date
                </label>
                <input
                  type="date"
                  value={formData.validity_end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, validity_end_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter form description"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Question
              </button>
            </div>

            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <input
                      type="text"
                      required
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Enter question text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="multiple_choice">Multiple Choice</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id={`required-${question.id}`}
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`required-${question.id}`} className="ml-2 text-sm text-gray-700">
                    Required question
                  </label>
                </div>

                {/* Options for radio, checkbox, multiple_choice */}
                {['radio', 'checkbox', 'multiple_choice'].includes(question.type) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(question.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Add Option
                      </button>
                    </div>
                    {question.options?.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(question.id, option.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
