'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()

// useEffect(() => {
//   if (!loading && !user) {
//     router.push('/') // if not logged in, go home
//   }
// }, [user, loading, router])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#b08d57]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }
 console.log(user,'userrrrrrrr2222')
  return (
    <div className="min-h-screen bg-[#f9f7f3] py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 sm:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Profile</h1>
              <p className="mt-2 text-sm text-gray-600">Manage your account information</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile/dashboard"
                className="logout-btn btn-back"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="logout-btn bg-[#b08d57] hover:bg-[#a3824d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <dl className="divide-y divide-gray-100">
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.full_name}</dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">@{user.username}</dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Account status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Member since</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>

        {user.role === 'admin' && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome to Seva Forms!</h3>
            <p className="text-sm text-gray-600 mb-6">
              You have successfully logged in to your account. This is a protected route that requires authentication.
            </p>

            {/* Admin dashboard entry is now shown on profile/dashboard instead */}
          </div>
        )}
      </div>
    </div>
  )
}
