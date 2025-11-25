'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import Image from "next/image"

export default function ProfileDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
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
    <div className="min-h-screen bg-[#f9f7f3] flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-2xl w-[69rem] max-w-dashboard p-8 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div
              className="flex shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              <Image
                src="/return%20to%20the%20source.svg"
                alt="Return to the Source"
                width={600}
                height={600}
              />
            </div>
          </div>
          <div className="flex space-x-4 text-sm text-gray-700">
            <button onClick={handleLogout} className="logout-btn hover:text-[#b08d57]">Log out</button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600 mb-6">{today}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/user/available"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <span className="text-[#b08d57]">🧘‍♂️</span>
              <span className="logout-btn text-gray-800 font-medium">Fill Chart</span>
            </div>
            <span className="text-gray-400">{'>'}</span>
          </Link>

          <Link
            href="/user/myresponses"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <span className="text-[#b08d57]">📄</span>
              <span className="logout-btn text-gray-800 font-medium">View Previous Chart</span>
            </div>
            <span className="text-gray-400">{'>'}</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <span className="text-[#b08d57]">👤</span>
              <span className="logout-btn text-gray-800 font-medium">Profile</span>
            </div>
            <span className="text-gray-400">{'>'}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
