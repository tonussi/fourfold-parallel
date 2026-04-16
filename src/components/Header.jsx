import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Menu, BookOpen, Settings, Search, Bookmark } from 'lucide-react'

export default function Header({ activeSection, onSectionChange, sections }) {
  const { isDark, toggleTheme } = useTheme()

  const menuItems = [
    { id: 'read', label: 'Read', icon: BookOpen },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Parallel Gospels
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                Compare Matthew • Mark • Luke • John
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeSection === item.id
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Section Selector (Mobile) */}
            <div className="relative md:hidden">
              <select
                value={activeSection}
                onChange={(e) => onSectionChange(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 
                          pl-3 pr-10 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 
                          focus:ring-indigo-500"
              >
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
              <Menu className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 
                        dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
