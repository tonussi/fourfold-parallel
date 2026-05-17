import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, User, Lock, AlertCircle, Loader2 } from 'lucide-react'
import versionData from '../../../VERSION.json'

function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('tlabs')
  const [password, setPassword] = useState('tlabs')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || t('auth.login_failed')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-500/20">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t('auth.welcome_back') || 'Welcome Back'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {t('auth.login_description') ||
              'Please sign in to continue to Fourfold'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                <AlertCircle
                  className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                  size={18}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-xs text-red-600 dark:text-red-400 underline mt-1"
                  >
                    {t('common.dismiss') || 'Dismiss'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                {t('auth.username') || 'Username'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  placeholder={
                    t('auth.username_placeholder') || 'Enter your username'
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                {t('auth.password') || 'Password'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  placeholder={
                    t('auth.password_placeholder') || 'Enter your password'
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <LogIn size={20} />
              )}
              {loading
                ? t('auth.signing_in') || 'Signing In...'
                : t('auth.sign_in') || 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('auth.no_account') ||
                "Don't have an account? Contact your administrator."}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />
            <span>© 2026 TLABS</span>
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />
          </div>
          <span className="text-xs text-slate-500">v{versionData.version}</span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
