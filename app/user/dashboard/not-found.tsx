'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function NotFound() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user && user.role === 'admin') {
        // If user is admin, redirect to admin dashboard
        router.replace('/admin/dashboard')
      } else if (user) {
        // If user is not admin, redirect to user dashboard
        router.replace('/user/dashboard')
      } else {
        // If not logged in, redirect to login
        router.replace('/')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
