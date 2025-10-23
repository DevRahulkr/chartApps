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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }
 console.log(user,'userrrrrrrr2222')
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                  <p className="mt-2 text-gray-600">Manage your account information</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.full_name}
                  </dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    @{user.username}
                  </dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.email}
                  </dd>
                </div>
                <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Account status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
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
          </div>

            {user.role === 'admin' && (<div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome to Seva Forms!</h3>
              <p className="text-gray-600 mb-6">
                You have successfully logged in to your account. This is a protected route that requires 
                authentication. Your JWT token is being used to access this page securely.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.role === 'admin' ? (
                  <Link
                    href="/admin/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    👑 Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/profile/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    📝 View Forms
                  </Link>
                )}
              </div>
            </div>)}
        </div>
      </div>
    </div>
  )
}
