'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthDialog } from '@/components/ui/auth-dialog'
import Image from "next/image"
import { api } from '@/lib/api'

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
  const [countries, setCountries] = useState<{ name: string; code: string; dial_code: string }[]>([]);
  const router = useRouter()
  const [selectedDialCode, setSelectedDialCode] = useState('');

  console.log(countries,'countries')

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await api.get('/countries');
        setCountries(res.data.countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    }

    fetchCountries();
  }, []);

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
  useEffect(() => {
  console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
}, []);
  
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
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b08d57]"></div>
      </div>
    )
  }

  // Don't show register form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b08d57]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f7f3] px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 sm:px-8 py-8 space-y-8">
          <div className="text-center space-y-4">
            <Image
              src="/return%20to%20the%20source.svg"
              alt="Return to the Source"
              width={200}
              height={200}
              className="mx-auto h-20 w-auto sm:h-24 md:h-28"
            />
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">Create your account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Already registered?{' '}
                <AuthDialog
                  triggerText="sign in"
                  title="Welcome back"
                  description="Enter your credentials to login to your account."
                >
                  <span className="font-medium text-[#b08d57] hover:text-[#a3824d] cursor-pointer">
                    Sign in
                  </span>
                </AuthDialog>
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                className="mt-1 input-field"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <label className="flex items-center space-x-2">
                  <input
                    {...register("gender", { required: "Please select gender" })}
                    type="radio"
                    value="Brother"
                    className="h-4 w-4 text-[#b08d57] border-gray-300 focus:ring-[#b08d57]"
                  />
                  <span className="text-gray-700 text-sm">Brother</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    {...register("gender", { required: "Please select gender" })}
                    type="radio"
                    value="Sister"
                    className="h-4 w-4 text-[#b08d57] border-gray-300 focus:ring-[#b08d57]"
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
                className="mt-1 input-field"
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
                className="mt-1 input-field"
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
              <select
                {...register('Country', { required: 'Country is required' })}
                onChange={(e) => {
                  const country = countries.find((c) => c.code === e.target.value);
                  if (country) setSelectedDialCode(country.dial_code);
                }}
                className="mt-1 input-field"
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
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
                className="mt-1 input-field"
                placeholder="Enter your BK Centre"
              />
              {errors.BKCentre && (
                <p className="mt-1 text-sm text-red-600">{errors.BKCentre.message}</p>
              )}
            </div>

            
            <div className="md:col-span-2">
              <label htmlFor="PhoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex rounded-lg border border-gray-200 bg-white shadow-sm">
                <span className="inline-flex items-center px-3 text-sm text-gray-600 border-r border-gray-200 rounded-l-lg bg-gray-50">
                  {selectedDialCode || '+--'}
                </span>
                <input
                  {...register('PhoneNumber', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[0-9\s\-()]{7,15}$/,
                      message: 'Enter a valid phone number',
                    },
                  })}
                  type="tel"
                  className="flex-1 rounded-r-lg bg-transparent px-3 py-2 text-sm text-gray-900 focus-visible:outline-none"
                  placeholder="Enter your phone number"
                />
              </div>
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
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                    message: "Enter a valid email address",
                  },
                })}
                type="email"
                autoComplete="email"
                className="mt-1 input-field"
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
                className="mt-1 input-field"
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
                className="mt-1 input-field"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:bg-gray-400"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
