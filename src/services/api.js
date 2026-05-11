import axios from 'axios'

const getBaseUrl = () => {
  if (import.meta.env.VITE_BIBLE_API_INTERNAL_URL) {
    return import.meta.env.VITE_BIBLE_API_INTERNAL_URL
  }
  const host = import.meta.env.VITE_BIBLE_API_URL || 'http://localhost'
  const port = import.meta.env.VITE_BIBLE_API_PORT || '3001'
  return `${host}:${port}`
}

const api = axios.create({
  baseURL: getBaseUrl(),
})

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Optional: Clear token and redirect to login if session expired
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error)
  }
)

export default api
