import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSidebar } from '../contexts/SidebarContext'
import { useTranslation } from 'react-i18next'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Layout,
  Info,
  Settings,
  Search,
  Bookmark,
  Languages,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import { selectImportState, resetImportState } from '../store'

export default function Sidebar() {
  const { isOpen, toggleSidebar, content, title, openSidebar } = useSidebar()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const importState = useSelector(selectImportState)

  useEffect(() => {
    if (importState?.status === 'completed') {
      openSidebar()
    }
  }, [importState?.status, openSidebar])

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'pt' : 'en'
    i18n.changeLanguage(newLang)
  }

  const currentLangName = i18n.language.startsWith('en') ? 'English' : 'Português'

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[90] lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-[100] bg-white dark:bg-slate-950 
          border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out flex flex-col
          ${
            isOpen
              ? 'w-80 translate-x-0'
              : 'w-80 -translate-x-full lg:w-16 lg:translate-x-0'
          }
        `}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-indigo-600 text-white p-1 rounded-full shadow-lg z-[100] hidden lg:flex items-center justify-center hover:bg-indigo-700 transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Sidebar Header */}
        <div
          className={`
          flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0
          ${!isOpen && 'lg:justify-center lg:px-0'}
        `}
        >
          {isOpen ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-3 shrink-0">
                <Layout size={18} />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white truncate uppercase tracking-wider text-sm">
                {title}
              </h2>
              <button
                onClick={toggleSidebar}
                className="ml-auto p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Layout size={18} />
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div
          className={`
          flex-1 overflow-y-auto py-6 px-4 space-y-6
          ${!isOpen && 'lg:hidden'}
        `}
        >
          {/* Background Import Status Card */}
          {importState && importState.status !== 'idle' && (
            <div className={`
              p-4 rounded-xl border mb-4 animate-in fade-in slide-in-from-top-2 duration-300
              ${importState.status === 'loading' ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : ''}
              ${importState.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : ''}
              ${importState.status === 'failed' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : ''}
            `}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {importState.status === 'loading' && <Loader2 size={16} className="animate-spin text-indigo-500 shrink-0" />}
                  {importState.status === 'completed' && <Check size={16} className="text-emerald-500 shrink-0" />}
                  {importState.status === 'failed' && <AlertCircle size={16} className="text-red-500 shrink-0" />}
                  <span className="truncate">
                    {importState.status === 'loading' && (t('import.processing') || 'Importing...')}
                    {importState.status === 'completed' && (t('import.success_title') || 'Import Complete')}
                    {importState.status === 'failed' && (t('import.error_title') || 'Import Failed')}
                  </span>
                </div>
                {(importState.status === 'completed' || importState.status === 'failed') && (
                  <button
                    onClick={() => dispatch(resetImportState())}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors ml-2 shrink-0"
                  >
                    <X size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                )}
              </div>
              
              <div className="mt-2 text-xs leading-relaxed opacity-95">
                {importState.status === 'loading' && (
                  <div className="space-y-2">
                    <p>
                      {t('import.loaded_sections') || 'Loaded'} {importState.currentSection} / {importState.totalSections} {t('import.sections') || 'sections'}
                    </p>
                    <div className="w-full bg-indigo-200/50 dark:bg-indigo-950/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 transition-all duration-300"
                        style={{ width: `${(importState.currentSection / importState.totalSections) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {importState.status === 'completed' && (
                  <p>{t('import.success_desc') || 'All verses have been successfully loaded and saved.'}</p>
                )}
                {importState.status === 'failed' && (
                  <p>{importState.error || t('import.error_desc') || 'An error occurred during import.'}</p>
                )}
              </div>
            </div>
          )}

          {content ? (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              {content}
            </div>
          ) : (
            <div className="space-y-4">
              <SidebarCard
                icon={<Info size={18} />}
                title={t('sidebar.about_title')}
                description={t('sidebar.about_description')}
              />
              <SidebarCard
                icon={<Bookmark size={18} />}
                title={t('sidebar.tip_title')}
                description={t('sidebar.tip_description')}
              />
            </div>
          )}
        </div>

        {/* Sidebar Footer/Nav */}
        <div
          className={`
          p-4 border-t border-slate-200 dark:border-slate-800 space-y-2
          ${!isOpen && 'lg:flex lg:flex-col lg:items-center lg:px-0 lg:py-6'}
        `}
        >
          {/* Language Switcher */}
          <div
            onClick={toggleLanguage}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group
              text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900
              ${!isOpen && 'lg:justify-center lg:p-3'}
            `}
            title={currentLangName}
          >
            <div className="shrink-0 group-hover:scale-110 transition-transform text-indigo-500">
              <Languages size={20} />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentLangName}</span>
                <span className="text-[10px] opacity-50">
                  {i18n.language.startsWith('en')
                    ? 'Switch to Portuguese'
                    : 'Mudar para Inglês'}
                </span>
              </div>
            )}
          </div>

          <NavIcon
            icon={<Search size={20} />}
            label={t('sidebar.search')}
            active={false}
            isOpen={isOpen}
          />
          <NavIcon
            icon={<Settings size={20} />}
            label={t('sidebar.settings')}
            active={false}
            isOpen={isOpen}
          />
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div
        className={`
        hidden lg:block transition-all duration-300 shrink-0
        ${isOpen ? 'w-80' : 'w-16'}
      `}
      />
    </>
  )
}

function SidebarCard({ icon, title, description }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 group">
      <div className="flex items-center gap-3 mb-2 text-slate-900 dark:text-white">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function NavIcon({ icon, label, active, isOpen }) {
  return (
    <div
      className={`
      flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group
      ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
      }
    `}
    >
      <div className="shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}

export { SidebarCard }
