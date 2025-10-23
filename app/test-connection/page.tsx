'use client'

import { useState } from 'react'

export default function TestConnection() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testBackendConnection = async () => {
    setLoading(true)
    setResult('Testing connection...\n')
    
    try {
      // Test 1: Get dummy token
      setResult(prev => prev + '1. Getting dummy token...\n')
      const tokenResponse = await fetch('http://localhost:8000/dummy-token')
      
      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`)
      }
      
      const tokenData = await tokenResponse.json()
      setResult(prev => prev + `✅ Token received: ${tokenData.access_token.substring(0, 50)}...\n`)
      
      // Test 2: Test profile endpoint
      setResult(prev => prev + '2. Testing profile endpoint...\n')
      const profileResponse = await fetch('http://localhost:8000/profile', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })
      
      if (!profileResponse.ok) {
        throw new Error(`Profile request failed: ${profileResponse.status}`)
      }
      
      const profile = await profileResponse.json()
      setResult(prev => prev + `✅ Profile: ${profile.full_name} (${profile.role})\n`)
      
      // Test 3: Test admin forms endpoint
      setResult(prev => prev + '3. Testing admin forms endpoint...\n')
      const formsResponse = await fetch('http://localhost:8000/admin/forms', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })
      
      if (!formsResponse.ok) {
        throw new Error(`Forms request failed: ${formsResponse.status}`)
      }
      
      const forms = await formsResponse.json()
      setResult(prev => prev + `✅ Forms found: ${forms.length}\n`)
      
      // Test 4: Test frontend API route
      setResult(prev => prev + '4. Testing frontend API route...\n')
      const frontendResponse = await fetch('/api/admin/forms', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })
      
      if (!frontendResponse.ok) {
        throw new Error(`Frontend API failed: ${frontendResponse.status}`)
      }
      
      const frontendForms = await frontendResponse.json()
      setResult(prev => prev + `✅ Frontend API: ${frontendForms.length} forms\n`)
      
      setResult(prev => prev + '\n🎉 ALL TESTS PASSED! Frontend-Backend connection is working!\n')
      
    } catch (error: any) {
      setResult(prev => prev + `\n❌ ERROR: ${error.message}\n`)
      setResult(prev => prev + '\n💡 Make sure:\n')
      setResult(prev => prev + '- Backend is running (python run.py)\n')
      setResult(prev => prev + '- Frontend is running (npm run dev)\n')
      setResult(prev => prev + '- No CORS issues\n')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Frontend-Backend Connection Test</h1>
        
        <div className="mb-6">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Test Results:</h2>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {result || 'Click "Test Connection" to start...'}
          </pre>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">What this test does:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Tests direct backend connection (http://localhost:8000)</li>
            <li>Tests authentication with dummy token</li>
            <li>Tests admin forms endpoint</li>
            <li>Tests frontend API routes (/api/admin/forms)</li>
            <li>Verifies complete frontend-backend communication</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
