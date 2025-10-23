'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Cookies from "js-cookie"

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
      console.log(selectedMonth,token,'selectedMonth')
      const res = await fetch(`/api/forms/month/${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setForms(data)
      } else toast.error('Failed to fetch forms')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Charts</h1>
            <p className="text-gray-600">Submit your pending Charts</p>
          </div>
          <Link
            href="/profile/dashboard"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

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
              onClick={fetchForms}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {forms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No forms available</div>
          ) : (
            forms.map((form) => <FormCard key={form.id} form={form} />)
          )}
        </div>
      </div>
    </div>
  )
}

function FormCard({ form }: { form: Form }) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{form.title}</h3>
        <p className="text-sm text-gray-700">{form.description}</p>
        <div className="text-sm text-gray-600 mt-1">
          Questions: {form.questions.length} | Created: {new Date(form.created_at).toLocaleDateString()}
        </div>
      </div>
      <Link
        href={`/user/forms/${form.id}/submit`}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Submit Form
      </Link>
    </div>
  )
}