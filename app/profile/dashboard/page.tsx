'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { api } from '@/lib/api'

export default function ProfileDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [resetIdentifier, setResetIdentifier] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [isResetLoading, setIsResetLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
  }

  const handleResetPassword = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required to reset passwords.')
      return
    }

    if (!resetIdentifier.trim() || !resetPassword.trim()) {
      toast.error('Please enter user identifier and new password.')
      return
    }

    try {
      setIsResetLoading(true)
      await api.post('/admin/users/reset-password', {
        user_identifier: resetIdentifier.trim(),
        new_password: resetPassword,
      })
      toast.success('Password reset successfully.')
      setResetIdentifier('')
      setResetPassword('')
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to reset password.'
      toast.error(message)
    } finally {
      setIsResetLoading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f9f7f3] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-md sm:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:gap-4 md:flex-row md:items-center md:justify-between">
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
          <div className="flex flex-wrap gap-3 text-sm text-gray-700 md:justify-end">
            <button
              onClick={handleLogout}
              className="btn-ghost logout-btn"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600 mb-6">{today}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Admin dashboard shortcut for admins */}
          {user.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-[#b08d57]">👑</span>
                <span className="logout-btn text-gray-800 font-medium">Admin Dashboard</span>
              </div>
              <span className="text-gray-400 self-end text-lg sm:self-auto">{'>'}</span>
            </Link>
          )}

          {/* Admin-only: Reset user password */}
          {user.role === 'admin' && (
            <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="mb-3 flex items-center space-x-3">
                <span className="text-[#b08d57]">🔐</span>
                <div>
                  <p className="logout-btn text-gray-800 font-medium">
                    Reset User Password
                  </p>
                  <p className="text-xs text-gray-500">
                    Enter user Phone Number and new password.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="User identifier (Phone Number)"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  className="input-field"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResetLoading}
                  className="w-full sm:w-auto btn-primary"
                >
                  {isResetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          )}

          {user.role !== 'admin' && (
            <Link
              href="/user/available"
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-[#b08d57]">🧘‍♂️</span>
                <span className="logout-btn text-gray-800 font-medium">Fill Chart</span>
              </div>
              <span className="text-gray-400 self-end text-lg sm:self-auto">{'>'}</span>
            </Link>
          )}

          {user.role !== 'admin' && (
            <Link
              href="/user/myresponses"
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-[#b08d57]">📄</span>
                <span className="logout-btn text-gray-800 font-medium">View Previous Chart</span>
              </div>
              <span className="text-gray-400 self-end text-lg sm:self-auto">{'>'}</span>
            </Link>
          )}

          <Link
            href="/profile"
            className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center space-x-3">
              <span className="text-[#b08d57]">👤</span>
              <span className="logout-btn text-gray-800 font-medium">Profile</span>
            </div>
            <span className="text-gray-400 self-end text-lg sm:self-auto">{'>'}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
