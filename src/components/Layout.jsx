import { SidebarProvider } from '../contexts/SidebarContext'
import Sidebar from './Sidebar'
import { useBackgroundImporter } from '../hooks/useBackgroundImporter'

export default function Layout({ children }) {
  useBackgroundImporter()

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
