import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('helpdesk_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if it's an authentication error from a protected route
    // Don't redirect if it's a login attempt failure
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      localStorage.removeItem('helpdesk_token')
      localStorage.removeItem('helpdesk_user')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('Access denied.')
    }
    return Promise.reject(error)
  }
)

export default api
