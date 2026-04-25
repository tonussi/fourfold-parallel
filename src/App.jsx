import { useState, useEffect, useCallback } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import SectionNav from './components/SectionNav'
import GospelColumn from './components/GospelColumn'
import MobileGospelTabs from './components/MobileGospelTabs'
import FileImport from './components/FileImport'
import {
  parseReference,
  LABELS,
  BOOKS_PROTESTANT,
  BibleVersionEnum,
  fetchVerses,
} from './verses'
import { Search } from 'lucide-react'
import parallelData from './data/parallelVerses.json'
import './App.css'

const GOSPELS = ['matthew', 'mark', 'luke', 'john']
const GOSPEL_CONFIG = {
  matthew: { title: 'Mateus', color: 'bg-blue-500' },
  mark: { title: 'Marcos', color: 'bg-red-500' },
  luke: { title: 'Lucas', color: 'bg-emerald-500' },
  john: { title: 'João', color: 'bg-purple-500' },
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

// Transform simplified verse format to full format with reference
const transformData = (data) => {
  if (!data?.sections) return data

  return {
    ...data,
    sections: data.sections.map((section) => ({
      ...section,
      passages: section.passages.map((passage) => {
        // If already has reference and verses array, return as-is
        if (
          passage.reference &&
          Array.isArray(passage.verses) &&
          passage.verses.length > 0
        ) {
          return passage
        }
        // Transform simplified format
        const versesStr = passage.verses || ''
        if (!versesStr) {
          return { ...passage, reference: '', verses: [] }
        }

        // Parse "chapter:verseFrom-verseTo" or "chapter:verse" format
        const match = versesStr.match(/^(\d+):(\d+)(?:-(\d+))?$/)
        if (!match) {
          return { ...passage, reference: '', verses: [] }
        }

        const chapter = match[1]
        const startVerse = parseInt(match[2], 10)
        const endVerse = match[3] ? parseInt(match[3], 10) : startVerse

        const bookName = capitalize(passage.gospel)
        const verseRef =
          startVerse === endVerse
            ? `${chapter}:${startVerse}`
            : `${chapter}:${startVerse}-${endVerse}`
        const reference = `${bookName} ${verseRef}`

        // Create empty verse array (text would be fetched from API)
        const verses = []
        for (let v = startVerse; v <= endVerse; v++) {
          verses.push({ verse: v, text: '' })
        }

        return { ...passage, reference, verses }
      }),
    })),
  }
}

// Helper function using @verses library to process verse references
function processVerseReference(reference) {
  if (!reference) return null
  // Use the verses library to parse the reference
  const parsed = parseReference(reference)
  return parsed
}

// Get display title from verses library
function getBookDisplayTitle(gospel) {
  const bookNum =
    LABELS[gospel] || LABELS[gospel.charAt(0).toUpperCase() + gospel.slice(1)]
  return bookNum ? BOOKS_PROTESTANT[bookNum] : gospel
}

function ParallelReader() {
  const [activeSection, setActiveSection] = useState('read')
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [importedData, setImportedData] = useState(null)
  const [activeGospelTab, setActiveGospelTab] = useState('matthew')
  const [isMobile, setIsMobile] = useState(false)
  const [sectionVerses, setSectionVerses] = useState({})
  const [isLoadingVerses, setIsLoadingVerses] = useState(false)
  const { sections } = parallelData

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Use imported data if available, otherwise use default (transformed)
  const displayData = importedData || transformData(parallelData)
  const displaySections = displayData.sections
  const currentSection = displaySections[currentSectionIndex]

  const loadVerses = useCallback(
    async (section) => {
      if (!section?.passages) return
      setIsLoadingVerses(true)
      const newVerses = {}

      try {
        // We iterate through all gospels in parallel
        await Promise.all(
          section.passages.map(async (passage) => {
            if (!passage.reference) return

            try {
              // The API returns an object like { "ACF": [...], "BYZ": [...] }
              const result = await fetchVerses(passage.reference, 'ACF')
              // Use ACF by default as shown in the user's example format
              const versionData = result.data?.ACF || result.ACF
              if (versionData && Array.isArray(versionData)) {
                newVerses[passage.gospel] = versionData.map((v) => ({
                  verse: v.verse,
                  text: v.scripture,
                }))
              }
            } catch (err) {
              console.error(
                `Failed to fetch verses for ${passage.gospel}:`,
                err
              )
            }
          })
        )
        setSectionVerses(newVerses)
      } catch (error) {
        console.error('Error loading section verses:', error)
      } finally {
        setIsLoadingVerses(false)
      }
    },
    [fetchVerses]
  )

  // Initial load
  useEffect(() => {
    if (displaySections && displaySections[currentSectionIndex]) {
      loadVerses(displaySections[currentSectionIndex])
    }
  }, [])

  // Log verses library usage for demonstration
  useEffect(() => {
    console.log(
      'Using @verses library - Available versions:',
      Object.keys(BibleVersionEnum)
    )
    if (currentSection?.passages) {
      console.log('Current section references:')
      currentSection.passages.forEach((p) => {
        if (p.reference) {
          const parsed = processVerseReference(p.reference)
          console.log(
            `  ${p.reference} -> Book #${parsed?.book}, Ch ${parsed?.chapter}, Verses ${parsed?.startVerse}-${parsed?.endVerse}`
          )
        }
      })
    }
  }, [currentSection])

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      const nextIdx = currentSectionIndex - 1
      setCurrentSectionIndex(nextIdx)
      loadVerses(displaySections[nextIdx])
    }
  }

  const handleNext = () => {
    if (currentSectionIndex < displaySections.length - 1) {
      const nextIdx = currentSectionIndex + 1
      setCurrentSectionIndex(nextIdx)
      loadVerses(displaySections[nextIdx])
    }
  }

  const handleImport = (data) => {
    setImportedData(data)
    setCurrentSectionIndex(0)
  }

  const handleResetToDefault = () => {
    setImportedData(null)
    setCurrentSectionIndex(0)
  }

  // Swipe navigation for mobile
  const handleSwipe = useCallback(
    (direction) => {
      const currentIdx = GOSPELS.indexOf(activeGospelTab)
      if (direction === 'left' && currentIdx < GOSPELS.length - 1) {
        setActiveGospelTab(GOSPELS[currentIdx + 1])
      } else if (direction === 'right' && currentIdx > 0) {
        setActiveGospelTab(GOSPELS[currentIdx - 1])
      }
    },
    [activeGospelTab]
  )

  const getPassageForGospel = (gospel) => {
    // Use verses library to get book display name
    const bookTitle = getBookDisplayTitle(gospel)

    const passage = currentSection.passages.find(
      (p) => p.gospel === gospel
    ) || {
      gospel,
      reference: '',
      verses: [],
    }

    // Merge fetched verses if available
    if (sectionVerses[gospel]) {
      return {
        ...passage,
        verses: sectionVerses[gospel],
      }
    }

    return passage
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sections={displaySections}
      />

      <SectionNav
        sections={displaySections}
        currentIndex={currentSectionIndex}
        onSelect={setCurrentSectionIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <main className="flex-1 overflow-hidden">
        {activeSection === 'read' && (
          <div className="h-full flex flex-col">
            {/* Mobile: Tabbed View with Swipe */}
            {isMobile ? (
              <MobileGospelTabs
                gospels={GOSPELS}
                gospelConfig={GOSPEL_CONFIG}
                activeTab={activeGospelTab}
                onTabChange={setActiveGospelTab}
                onSwipe={handleSwipe}
                currentSection={currentSection}
                getPassageForGospel={getPassageForGospel}
              />
            ) : (
              /* Desktop: 4-Column Grid */
              <div className="flex-1 p-4 lg:p-6 overflow-hidden">
                <div className="max-w-[1920px] mx-auto h-full">
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-fr h-full">
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
          </div>
        )}

        {activeSection === 'search' && (
          <div className="flex items-center justify-center h-[calc(100vh-220px)] md:h-[calc(100vh-200px)]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Busca
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Busque nos quatro evangelhos simultaneamente
              </p>
              <a
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
              >
                <Search className="w-5 h-5" />
                Abrir Página de Busca
              </a>
            </div>
          </div>
        )}

        {activeSection === 'bookmarks' && (
          <div className="flex items-center justify-center h-[calc(100vh-220px)] md:h-[calc(100vh-200px)]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Favoritos
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Salve e organize suas passagens favoritas
              </p>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] overflow-y-auto p-4 lg:p-6 mb-16 md:mb-0">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Configurações
              </h2>

              {/* Import Section */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <FileImport onImport={handleImport} />
              </div>

              {/* Reset to Default */}
              {importedData && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Fonte de Dados Atual
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Exibindo:{' '}
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {displayData.title}
                    </span>
                  </p>
                  <button
                    onClick={handleResetToDefault}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info - Hidden on mobile to save space */}
      <footer className="hidden md:block py-2 px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>{displayData.title}</p>
          <span className="text-indigo-500">@verses lib</span>
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
