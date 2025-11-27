'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { AuthDialog } from '@/components/ui/auth-dialog'
import Image from 'next/image'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/profile/dashboard') // if logged in, go to dashboard
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#b08d57]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 sm:px-8 py-8 space-y-8 text-center">
          <div className="flex justify-center">
            <Image
              src="/return%20to%20the%20source.svg"
              alt="Return to the Source"
              width={200}
              height={200}
              className="h-20 w-auto sm:h-24 md:h-28"
              priority
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">Self Progress Chart</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account or create a new one
            </p>
          </div>
          <div className="space-y-4">
            <AuthDialog
              triggerText="Sign in to your account"
              title="Welcome back"
              description="Enter your credentials to login to your account."
            >
              <button type="button" className="btn-primary w-full">
                Sign In
              </button>
            </AuthDialog>

            <Link href="/register" className="btn-outline w-full text-center">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
