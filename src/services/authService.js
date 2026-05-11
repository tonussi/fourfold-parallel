import api from './api'

/**
 * Authentication Service
 */
const authService = {
  /**
   * Register a new user
   * @param {string} username 
   * @param {string} password 
   */
  async register(username, password) {
    const response = await api.post('/api/auth/register', { username, password })
    return response.data
  },

  /**
   * Login and store token
   * @param {string} username 
   * @param {string} password 
   */
  async login(username, password) {
    const response = await api.post('/api/auth/login', { username, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  /**
   * Logout and clear storage
   */
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (e) {
      console.error('Error parsing user from localStorage:', e)
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token')
  }
}

export default authService
