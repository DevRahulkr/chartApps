'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthDialog } from '@/components/ui/auth-dialog'
import Image from "next/image"

interface RegisterForm {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  City: string
  State: string
  Country: string
  BKCentre: string
  PhoneNumber: string
  gender: string
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading, register: registerUser } = useAuth()
  const router = useRouter()
  console.log("page:",router, user) 
  // Redirect if already authenticated
  // useEffect(() => {
  //   if (!loading && user) {
  //     if (user.role === 'admin') {
  //       router.push('/admin/dashboard')
  //     } else {
  //       router.push('/user/dashboard')
  //     }
  //   }
  // }, [user, loading, router])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>()

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await registerUser(data.email, data.username, data.password, data.fullName)
      toast.success('Registration successful!')
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't show register form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <Image
              src="/return%20to%20the%20source.svg"  
              alt="Return to the Source"
              width={600}  
              height={600} 
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <AuthDialog
              triggerText="sign in to your existing account"
              title="Welcome back"
              description="Enter your credentials to login to your account."
            >
              <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                sign in to your existing account
              </span>
            </AuthDialog>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Full name must be at least 2 characters',
                  },
                })}
                type="text"
                autoComplete="name"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-2 flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    {...register("gender", { required: "Please select gender" })}
                    type="radio"
                    value="Brother"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm">Brother</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    {...register("gender", { required: "Please select gender" })}
                    type="radio"
                    value="Sister"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm">Sister</span>
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>


            <div>
              <label htmlFor="City" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                {...register('City', {
                  required: 'City is required',
                  minLength: {
                    value: 3,
                    message: 'City must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'City can only contain letters, numbers, and underscores',
                  },
                })}
                type="text"
                autoComplete="City"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your City"
              />
              {errors.City && (
                <p className="mt-1 text-sm text-red-600">{errors.City.message}</p>
              )}
            </div>
            
            
            <div>
              <label htmlFor="State" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                {...register('State', {
                  required: 'State is required',
                  minLength: {
                    value: 3,
                    message: 'State must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'State can only contain letters, numbers, and underscores',
                  },
                })}
                type="text"
                autoComplete="State"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your State"
              />
              {errors.State && (
                <p className="mt-1 text-sm text-red-600">{errors.State.message}</p>
              )}
            </div>

            
            <div>
              <label htmlFor="Country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                {...register('Country', {
                  required: 'Country is required',
                  minLength: {
                    value: 3,
                    message: 'Country must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Country can only contain letters, numbers, and underscores',
                  },
                })}
                type="text"
                autoComplete="Country"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your Country"
              />
              {errors.Country && (
                <p className="mt-1 text-sm text-red-600">{errors.Country.message}</p>
              )}
            </div>

            
            <div>
              <label htmlFor="BKCentre" className="block text-sm font-medium text-gray-700">
                BK Centre
              </label>
              <input
                {...register('BKCentre', {
                  required: 'BKCentre is required',
                  minLength: {
                    value: 3,
                    message: 'BKCentre must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'BKCentre can only contain letters, numbers, and underscores',
                  },
                })}
                type="text"
                autoComplete="BKCentre"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your BK Centre"
              />
              {errors.BKCentre && (
                <p className="mt-1 text-sm text-red-600">{errors.BKCentre.message}</p>
              )}
            </div>

            
            <div>
              <label htmlFor="PhoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...register('PhoneNumber', {
                  required: 'PhoneNumber is required',
                  minLength: {
                    value: 3,
                    message: 'PhoneNumber must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'PhoneNumber can only contain letters, numbers, and underscores',
                  },
                })}
                type="text"
                autoComplete="PhoneNumber"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your Phone Number"
              />
              {errors.PhoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.PhoneNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
