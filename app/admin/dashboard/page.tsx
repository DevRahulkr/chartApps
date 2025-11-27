'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAuthHeaders } from '@/lib/auth'
import { api } from '@/lib/api'
import Image from 'next/image'

interface Form {
  id: string
  title: string
  description: string
  month: string
  questions: Question[]
  is_active: boolean
  created_at: string
  response_count?: number
}

interface Question {
  id: string
  type: string
  text: string
  required: boolean
  options?: { id: string; text: string }[]
  placeholder?: string
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      fetchForms()
    }
  }, [user, loading, router])

const fetchForms = async () => {
  try {
    const res = await api.get('/admin/forms')

    const formsWithCounts = await Promise.all(
      res.data.map(async (form: Form) => {
        try {
          const countRes = await api.get(`/admin/forms/${form.id}/response-count`)
          return { ...form, response_count: countRes.data.response_count }
        } catch {
          return { ...form, response_count: 0 }
        }
      })
    )

    setForms(formsWithCounts)
  } catch (error) {
    toast.error('Failed to fetch forms')
  } finally {
    setIsLoading(false)
  }
}

const deleteForm = async (formId: string) => {
  if (!confirm('Are you sure you want to delete this form?')) return

  try {
    await api.delete(`/admin/forms/${formId}`)
    toast.success('Form deleted successfully')
    fetchForms()
  } catch {
    toast.error('Error deleting form')
  }
}


  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b08d57] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
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
              <Link
                href="/admin/forms/create"
                className="w-full sm:w-auto text-center btn-primary"
              >
                Create New Form
              </Link>
              <Link
                href="/profile"
                className="w-full sm:w-auto logout-btn btn-back"
              >
                Back to Profile
              </Link>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage forms and view responses</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Forms</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {forms.filter(form => form.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {forms.reduce((total, form) => total + (form.response_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Forms</h2>
          </div>
          
          {forms.length === 0 ? (
            <div className="text-center py-12 px-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No forms</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new form.</p>
              <div className="mt-6">
                <Link
                  href="/admin/forms/create"
                  className="btn-primary"
                >
                  Create New Form
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {forms.map((form) => (
                <div key={form.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">{form.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          form.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {form.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-800 font-medium">{form.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700 font-medium">
                        <span className="bg-gray-100 px-2 py-1 rounded">Month: {form.month}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Questions: {form.questions.length}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Responses: {form.response_count || 0}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Created: {new Date(form.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <Link
                        href={`/admin/forms/${form.id}/responses`}
                        className="text-sm font-medium text-[#b08d57] hover:text-[#a3824d]"
                      >
                        View Responses ({form.response_count || 0})
                      </Link>
                      <Link
                        href={`/admin/forms/${form.id}/edit`}
                        className="text-sm font-medium text-[#b08d57] hover:text-[#a3824d]"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteForm(form.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
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
