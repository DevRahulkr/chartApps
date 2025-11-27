'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import Image from 'next/image'

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

    const toDateInput = (value?: string | null) => {
      if (!value) return ''
      return value.split('T')[0]
    }

    setFormData({
      title: form.title,
      description: form.description,
      month: form.month?.slice(0, 7) || '',      
      chart_start_date: toDateInput(form.chart_start_date),
      chart_end_date: toDateInput(form.chart_end_date),
      validity_start_date: toDateInput(form.validity_start_date),
      validity_end_date: toDateInput(form.validity_end_date),
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
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b08d57] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to edit forms.</p>
          <Link href="/profile/dashboard" className="text-[#b08d57] hover:text-[#a3824d]">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#f9f7f3] px-4 py-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 sm:px-8 py-6">
          <div className="flex flex-col gap-6 sm:gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center justify-between gap-3 md:justify-start">
              <div
                className="flex shrink-0 items-center justify-center rounded-full bg-white/40 p-2"
                aria-hidden="true"
              >
                <Image
                  src="/return%20to%20the%20source.svg"
                  alt="Return to the Source"
                  width={200}
                  height={200}
                  className="h-12 w-auto sm:h-14 md:h-16"
                  priority
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete Form
              </button>
              <Link
                href="/admin/dashboard"
                className="w-full sm:w-auto logout-btn btn-back"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Edit Form</h1>
            <p className="text-sm text-gray-600">Update form details and questions</p>
          </div>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form Details */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
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
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field"
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
                className="input-field"
                placeholder="Enter form description"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="w-full sm:w-auto btn-primary"
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
                      className="input-field"
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
                      className="input-field"
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
                          className="flex-1 input-field"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/dashboard"
              className="w-full sm:w-auto text-center btn-outline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto btn-primary disabled:bg-gray-400"
            >
              {isSubmitting ? 'Updating...' : 'Update Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
