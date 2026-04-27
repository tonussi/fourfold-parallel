import { useSidebar } from '../contexts/SidebarContext'
import { X, ChevronLeft, ChevronRight, Layout, Info, Settings, Search, Bookmark } from 'lucide-react'

export default function Sidebar() {
  const { isOpen, toggleSidebar, content, title } = useSidebar()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white dark:bg-slate-950 
          border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0'}
        `}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-indigo-600 text-white p-1 rounded-full shadow-lg z-50 hidden lg:flex items-center justify-center hover:bg-indigo-700 transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Sidebar Header */}
        <div className={`
          flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0
          ${!isOpen && 'lg:justify-center lg:px-0'}
        `}>
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
        <div className={`
          flex-1 overflow-y-auto py-6 px-4 space-y-6
          ${!isOpen && 'lg:hidden'}
        `}>
          {content ? (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              {content}
            </div>
          ) : (
            <div className="space-y-4">
              <SidebarCard 
                icon={<Info size={18} />} 
                title="Sobre o Projeto"
                description="Comparação paralela dos quatro evangelhos para estudo sinótico."
              />
              <SidebarCard 
                icon={<Bookmark size={18} />} 
                title="Dica"
                description="Clique em qualquer palavra para destacá-la em todos os evangelhos."
              />
            </div>
          )}
        </div>

        {/* Sidebar Footer/Nav */}
        <div className={`
          p-4 border-t border-slate-200 dark:border-slate-800 space-y-2
          ${!isOpen && 'lg:flex lg:flex-col lg:items-center lg:px-0 lg:py-6'}
        `}>
          <NavIcon icon={<Search size={20} />} label="Busca" active={false} isOpen={isOpen} />
          <NavIcon icon={<Settings size={20} />} label="Ajustes" active={false} isOpen={isOpen} />
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div className={`
        hidden lg:block transition-all duration-300 shrink-0
        ${isOpen ? 'w-80' : 'w-16'}
      `} />
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
    <div className={`
      flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group
      ${active 
        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}
    `}>
      <div className="shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}

export { SidebarCard }
