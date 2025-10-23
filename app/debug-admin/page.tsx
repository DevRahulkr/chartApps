'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugAdmin() {
  const { user, loading } = useAuth()
  const [debugResults, setDebugResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setDebugResults(prev => [...prev, message])
  }

  const clearResults = () => {
    setDebugResults([])
  }

  const debugAdminAccess = async () => {
    setIsLoading(true)
    clearResults()
    
    addResult('🔍 DEBUGGING ADMIN ACCESS')
    addResult('='.repeat(50))
    
    // Step 1: Check user authentication
    addResult('\n1. Checking user authentication...')
    if (!user) {
      addResult('❌ No user logged in')
      addResult('💡 Please login first')
      setIsLoading(false)
      return
    }
    
    addResult(`✅ User logged in: ${user.full_name}`)
    addResult(`   Email: ${user.email}`)
    addResult(`   Role: ${user.role}`)
    addResult(`   Username: ${user.username}`)
    
    // Step 2: Check if user is admin
    if (user.role !== 'admin') {
      addResult('\n❌ User is NOT an admin!')
      addResult('💡 Current role: ' + user.role)
      addResult('💡 Need admin role to access admin features')
      setIsLoading(false)
      return
    }
    
    addResult('\n✅ User has admin role')
    
    // Step 3: Test backend connection
    addResult('\n2. Testing backend connection...')
    try {
      const tokenResponse = await fetch('http://localhost:8000/dummy-token')
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        addResult('✅ Backend connection successful')
        addResult(`   Token: ${tokenData.access_token.substring(0, 50)}...`)
        
        // Step 4: Test admin forms endpoint
        addResult('\n3. Testing admin forms endpoint...')
        const formsResponse = await fetch('http://localhost:8000/admin/forms', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        })
        
        if (formsResponse.ok) {
          const forms = await formsResponse.json()
          addResult('✅ Admin forms endpoint successful')
          addResult(`   Found ${forms.length} forms`)
          forms.forEach((form: any, index: number) => {
            addResult(`   ${index + 1}. ${form.title} (${form.month})`)
          })
        } else {
          addResult(`❌ Admin forms endpoint failed: ${formsResponse.status}`)
          const error = await formsResponse.text()
          addResult(`   Error: ${error}`)
        }
        
        // Step 5: Test frontend API route
        addResult('\n4. Testing frontend API route...')
        const frontendResponse = await fetch('/api/admin/forms', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        })
        
        if (frontendResponse.ok) {
          const frontendForms = await frontendResponse.json()
          addResult('✅ Frontend API route successful')
          addResult(`   Found ${frontendForms.length} forms`)
        } else {
          addResult(`❌ Frontend API route failed: ${frontendResponse.status}`)
          const error = await frontendResponse.text()
          addResult(`   Error: ${error}`)
        }
        
      } else {
        addResult('❌ Backend connection failed')
        addResult(`   Status: ${tokenResponse.status}`)
      }
    } catch (error: any) {
      addResult(`❌ Backend connection error: ${error.message}`)
      addResult('💡 Make sure backend is running: python run.py')
    }
    
    // Step 6: Check localStorage
    addResult('\n5. Checking localStorage...')
    const storedToken = localStorage.getItem('access_token')
    if (storedToken) {
      addResult('✅ Token found in localStorage')
      addResult(`   Token: ${storedToken.substring(0, 50)}...`)
    } else {
      addResult('❌ No token in localStorage')
      addResult('💡 This might be the issue!')
    }
    
    addResult('\n' + '='.repeat(50))

    addResult('🎯 DEBUGGING COMPLETE')
    
    setIsLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please Login First</h2>
          <p className="text-gray-600 mt-2">You need to be logged in to debug admin access</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Admin Access Debug</h1>
          
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">Current User Info:</h3>
              <p><strong>Name:</strong> {user.full_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role:</strong> <span className={`px-2 py-1 rounded text-sm ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.role}
              </span></p>
            </div>
          </div>
          
          <div className="mb-6">
            <button
              onClick={debugAdminAccess}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
            >
              {isLoading ? 'Debugging...' : 'Debug Admin Access'}
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Results
            </button>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Debug Results:</h2>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
              {debugResults.length === 0 ? 'Click "Debug Admin Access" to start...' : debugResults.join('\n')}
            </pre>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <h3 className="font-medium mb-2">What this debug does:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Checks if you're logged in and have admin role</li>
              <li>Tests backend connection and authentication</li>
              <li>Tests admin forms endpoint</li>
              <li>Tests frontend API routes</li>
              <li>Checks localStorage for authentication token</li>
              <li>Identifies the exact issue preventing admin access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
