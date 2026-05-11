import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Sun,
  Moon,
  BookOpen,
  Settings,
  Search,
  Bookmark,
  ExternalLink,
  BarChart3,
  User,
  LogOut,
  LogIn,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import LoginModal from './LoginModal'

export default function Header({ activeSection, onSectionChange, sections }) {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout, isAuthenticated } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const menuItems = [
    { id: 'read', label: t('common.read'), icon: BookOpen },
    { id: 'statistics', label: t('common.statistics'), icon: BarChart3 },
    { id: 'search', label: t('common.search'), icon: Search },
    { id: 'bookmarks', label: t('common.bookmarks'), icon: Bookmark },
    { id: 'settings', label: t('common.settings'), icon: Settings },
  ]

  const handleSectionClick = (id) => {
    if (id === 'search') {
      navigate('/search')
    } else {
      onSectionChange(id)
    }
  }

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 md:dark:bg-slate-900/80 md:backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto">
          {/* Mobile Header - Compact */}
          <div className="flex items-center justify-between h-14 px-3 md:hidden">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen size={18} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {t('common.gospels')}
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <User size={14} className="text-indigo-600" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[60px]">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                  aria-label="Login"
                >
                  <LogIn size={20} />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg
                         text-slate-600 dark:text-slate-400
                         active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                aria-label={t('common.toggle_theme')}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">
                  {t('common.parallel_gospels')}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('common.compare_gospels')}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <User size={16} className="text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="ml-2 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 dark:shadow-none transition-all"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl
                         text-slate-600 hover:bg-slate-100
                         dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label={t('common.toggle_theme')}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 
                     bg-white dark:bg-slate-900 
                     border-t border-slate-200 dark:border-slate-800
                     pb-safe"
      >
        <div className="flex items-center justify-around h-14">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`
                  flex flex-col items-center justify-center flex-1 h-full
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
                  }
                `}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-0.5">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  )
}
