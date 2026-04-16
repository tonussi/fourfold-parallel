import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import SectionNav from './components/SectionNav'
import GospelColumn from './components/GospelColumn'
import parallelData from './data/parallelVerses.json'

const GOSPELS = ['matthew', 'mark', 'luke', 'john']

function ParallelReader() {
  const [activeSection, setActiveSection] = useState('read')
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const { sections } = parallelData

  const currentSection = sections[currentSectionIndex]

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1)
    }
  }

  const getPassageForGospel = (gospel) => {
    return currentSection.passages.find(p => p.gospel === gospel) || {
      gospel,
      reference: '',
      verses: []
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      <Header 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sections={sections}
      />

      <SectionNav
        sections={sections}
        currentIndex={currentSectionIndex}
        onSelect={setCurrentSectionIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <main className="flex-1 overflow-hidden">
        {activeSection === 'read' && (
          <div className="h-full p-4 lg:p-6">
            <div className="max-w-[1920px] mx-auto h-full">
              {/* 4-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
                {GOSPELS.map((gospel) => {
                  const passage = getPassageForGospel(gospel)
                  return (
                    <GospelColumn
                      key={gospel}
                      gospel={gospel}
                      reference={passage.reference}
                      verses={passage.verses}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'search' && (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Search Coming Soon
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Search across all four Gospels simultaneously
              </p>
            </div>
          </div>
        )}

        {activeSection === 'bookmarks' && (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Bookmarks Coming Soon
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Save and organize your favorite passages
              </p>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Settings Coming Soon
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Customize fonts, themes, and more
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="py-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>{parallelData.title}</p>
          <p>King James Version</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ParallelReader />
    </ThemeProvider>
  )
}

export default App
