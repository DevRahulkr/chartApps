'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = Cookies.get('access_token')
    if (token) {
      try {
        const response = await api.get('/profile')
        setUser(response.data)
      } catch (error) {
        // Token might be expired, try to refresh
        try {
          await refreshToken()
        } catch (refreshError) {
          // Refresh failed, clear tokens
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
        }
      }
    }
    setLoading(false)
  }

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await api.post('/login', { 
        email_or_username: emailOrUsername, 
        password 
      })
      const { access_token, refresh_token } = response.data
      
      // Store tokens in httpOnly cookies would be ideal, but for demo we'll use regular cookies
      Cookies.set('access_token', access_token, { expires: 1/24 }) // 1 hour
      Cookies.set('refresh_token', refresh_token, { expires: 7 }) // 7 days
      
      // Get user profile
      const profileResponse = await api.get('/profile')
      setUser(profileResponse.data)
      
      router.push('/profile')
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  const register = async (email: string, username: string, password: string, fullName: string) => {
    try {
      await api.post('/register', { email, username, password, full_name: fullName })
      // After successful registration, log the user in
      await login(email, password)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  }

  const logout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    setUser(null)
    router.push('/')
  }

  const refreshToken = async () => {
    const refreshToken = Cookies.get('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await api.post('/refresh', { refresh_token: refreshToken })
      const { access_token } = response.data
      
      Cookies.set('access_token', access_token, { expires: 1/24 }) // 1 hour
      
      // Get user profile
      const profileResponse = await api.get('/profile')
      setUser(profileResponse.data)
    } catch (error) {
      throw new Error('Token refresh failed')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
