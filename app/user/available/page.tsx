'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Cookies from "js-cookie"
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

interface Question {
  id: string
  type: string
  text: string
  required: boolean
  options?: { id: string; text: string }[]
  placeholder?: string
}

export default function AvailableFormsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isLoading, setIsLoading] = useState(true)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchForms()
    }
  }, [user, loading, router])

const token = Cookies.get("access_token")

const fetchForms = async () => {
  try {
    const res = await api.get(`/forms/month/${selectedMonth}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    setForms(res.data)
    
  } catch (err) {
    toast.error('Error fetching forms')
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
    <div className="min-h-screen bg-[#f9f7f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header card – matches profile style */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 sm:px-8 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Available Charts</h1>
              <p className="mt-2 text-sm text-gray-600">Submit your pending charts</p>
            </div>
            <Link
              href="/profile/dashboard"
              className="w-full sm:w-auto logout-btn btn-back"
            >
              Back to Dashboard
            </Link>
          </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4">
            <label htmlFor="month" className="text-sm font-medium text-gray-700">
              Select Month:
            </label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full max-w-[200px] input-field"
            />
            <button
              onClick={fetchForms}
              className="w-full sm:w-auto btn-primary"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-200">
          {forms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No forms available</div>
          ) : (
            forms.map((form) => <FormCard key={form.id} form={form} />)
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

function FormCard({ form }: { form: Form }) {
  return (
    <div className="px-4 sm:px-6 py-4 hover:bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <h3 className="text-lg font-bold text-gray-900">{form.title}</h3>
        <p className="text-sm text-gray-700">{form.description}</p>
        <div className="text-sm text-gray-600 mt-1">
          Questions: {form.questions.length} | Created: {new Date(form.created_at).toLocaleDateString()}
        </div>
      </div>
      <Link
        href={`/user/forms/${form.id}/submit`}
        className="mt-2 sm:mt-0 w-full sm:w-auto text-center btn-primary"
      >
        Submit Form
      </Link>
    </div>
  )
}