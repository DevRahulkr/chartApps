'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      fetchForms(selectedMonth)
    }
  }, [user, loading, router, selectedMonth])

const token = Cookies.get("access_token")

const fetchForms = async (month = selectedMonth) => {
  try {
    setIsLoading(true)
    const res = await api.get(`/forms/month/${month}`, {
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
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f7f3] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Available Charts</h1>
            <p className="text-sm text-gray-600">Submit your pending Charts</p>
          </div>
          <Link
            href="/profile/dashboard"
            className="logout-btn bg-[#b08d57] hover:bg-[#a3824d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

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
              onClick={() => fetchForms(selectedMonth)}
              className="logout-btn bg-[#b08d57] hover:bg-[#a3824d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-100">
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
    <div className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between hover:bg-gray-50">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
        <p className="text-sm text-gray-700">{form.description}</p>
        <div className="text-sm text-gray-600 mt-1">
          Questions: {form.questions.length} | Created: {new Date(form.created_at).toLocaleDateString()}
        </div>
      </div>
      <Link
        href={`/user/forms/${form.id}/submit`}
        className="logout-btn bg-[#b08d57] hover:bg-[#a3824d] text-white px-5 py-2.5 rounded-xl text-sm font-medium text-center transition-colors"
      >
        Submit Form
      </Link>
    </div>
  )
}