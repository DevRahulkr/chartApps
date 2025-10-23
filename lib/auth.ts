import Cookies from 'js-cookie'

export function getAuthToken(): string | null {
  // Try localStorage first (for compatibility)
  const localToken = localStorage.getItem('access_token')
  if (localToken) {
    return localToken
  }
  
  // Try cookies (AuthContext uses cookies)
  const cookieToken = Cookies.get('access_token')
  if (cookieToken) {
    return cookieToken
  }
  
  // Try document.cookie as fallback
  const cookieMatch = document.cookie.split('; ').find(row => row.startsWith('access_token='))
  if (cookieMatch) {
    return cookieMatch.split('=')[1]
  }
  
  return null
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  if (!token) {
    return {}
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}
