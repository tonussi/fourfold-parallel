import { createContext, useContext, useState, useCallback } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState(null)
  const [title, setTitle] = useState('Menu')

  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), [])
  const openSidebar = useCallback(() => setIsOpen(true), [])
  const closeSidebar = useCallback(() => setIsOpen(false), [])

  const setSidebarContent = useCallback((newContent, newTitle = 'Menu') => {
    setContent(newContent)
    setTitle(newTitle)
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        content,
        setSidebarContent,
        title,
        setTitle
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
