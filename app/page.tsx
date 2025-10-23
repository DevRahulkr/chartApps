'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { AuthDialog } from '@/components/ui/auth-dialog'
import { Button } from '@/components/ui/button'
import Image from "next/image"

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
           <div className="flex justify-center mb-6">
                    <Image
                      src="/return%20to%20the%20source.svg"  
                      alt="Return to the Source"
                      width={600}  
                      height={600} 
                    />
                  </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Self Progress Chart
          </h2>
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
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </AuthDialog>
          
          <Link
            href="/register"
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
