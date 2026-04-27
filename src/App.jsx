import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ThemeProvider } from './contexts/ThemeContext'
import { SidebarProvider, useSidebar } from './contexts/SidebarContext'
import Header from './components/Header'
import SectionNav from './components/SectionNav'
import GospelColumn from './components/GospelColumn'
import MobileGospelTabs from './components/MobileGospelTabs'
import FileImport from './components/FileImport'
import Sidebar, { SidebarCard } from './components/Sidebar'
import {
  parseReference,
  LABELS,
  BOOKS_PROTESTANT,
  BibleVersionEnum,
  fetchVerses,
} from './verses'
import { Search, Download, BookOpen, FileText } from 'lucide-react'
import parallelData from './data/parallelVerses.json'
import {
  selectCurrentVersion,
  selectCurrentSectionIndex,
  selectActiveGospelTab,
  setSelectedVersion,
  setCurrentSectionIndex,
  setActiveGospelTab,
} from './store'
import './App.css'

const GOSPELS = ['matthew', 'mark', 'luke', 'john']
const GOSPEL_CONFIG = {
  matthew: { title: 'Mateus', color: 'bg-blue-500' },
  mark: { title: 'Marcos', color: 'bg-red-500' },
  luke: { title: 'Lucas', color: 'bg-emerald-500' },
  john: { title: 'João', color: 'bg-purple-500' },
}

const EXAMPLES = [
  {
    name: 'The Complete Gospels (Q)',
    file: 'TheCompleteGospels-Q.csv',
    type: 'CSV',
  },
  { name: 'Bart Ehrman - Q', file: 'BartEhrman-Q.csv', type: 'CSV' },
  { name: 'A Theology of Q', file: 'ATheologyOfQ-Q.csv', type: 'CSV' },
  { name: 'Research Notes', file: 'Q-Researchers.md', type: 'MD' },
]

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
  const dispatch = useDispatch()
  const [activeSection, setActiveSection] = useState('read')
  const [importedData, setImportedData] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [sectionVerses, setSectionVerses] = useState({})
  const [isLoadingVerses, setIsLoadingVerses] = useState(false)
  const [highlightedWord, setHighlightedWord] = useState(null)
  const { setSidebarContent, setTitle } = useSidebar()

  // Redux state
  const selectedVersion = useSelector(selectCurrentVersion)
  const currentSectionIndex = useSelector(selectCurrentSectionIndex)
  const activeGospelTab = useSelector(selectActiveGospelTab)

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
  const currentSection = displaySections[currentSectionIndex] || {
    title: 'Carregando...',
    id: 'loading',
  }

  const loadVerses = useCallback(
    async (section) => {
      if (!section?.passages) return
      setIsLoadingVerses(true)
      const newVerses = {}

      try {
        const segments = []
        const passageMap = {} // Map book number to gospel name for easy assignment

        section.passages.forEach((passage) => {
          if (!passage.reference) return
          const parsedList = parseReference(passage.reference)
          if (!parsedList) return

          parsedList.forEach((parsed) => {
            segments.push({
              book: parsed.book,
              chapter: parsed.chapter,
              from: parsed.from,
              to: parsed.to,
              publisher: selectedVersion,
            })

            // Use the book number to map back to the passage gospel
            // Matthew: 40, Mark: 41, Luke: 42, John: 43
            passageMap[parsed.book] = passage.gospel
          })
        })

        if (segments.length > 0) {
          const result = await fetchVerses(segments)
          // The API returns results keyed by the publisher label
          // Try specific version first, then fallback to first available array
          const versionVerses =
            result[selectedVersion] ||
            result.data?.[selectedVersion] ||
            Object.values(result).find((val) => Array.isArray(val))

          if (versionVerses && Array.isArray(versionVerses)) {
            // Group verses by their book number
            versionVerses.forEach((v) => {
              const gospel = passageMap[v.book]
              if (gospel) {
                if (!newVerses[gospel]) newVerses[gospel] = []
                newVerses[gospel].push({
                  verse: v.verse,
                  text: v.scripture,
                })
              }
            })
          }
        }
        setSectionVerses(newVerses)
      } catch (error) {
        console.error('Error loading section verses:', error)
      } finally {
        setIsLoadingVerses(false)
      }
    },
    [selectedVersion]
  )

  // Initial load
  useEffect(() => {
    if (displaySections && displaySections[currentSectionIndex]) {
      loadVerses(displaySections[currentSectionIndex])
    }
  }, [currentSectionIndex, loadVerses])

  useEffect(() => {
    if (activeSection === 'read') {
      setTitle('Leitura')
      setSidebarContent(
        <div className="space-y-4">
          <SidebarCard
            icon={<BookOpen size={18} />}
            title="Sessão Atual"
            description={currentSection?.title || 'Sem título'}
          />
          <SidebarCard
            icon={<FileText size={18} />}
            title="Fonte"
            description={displayData.title}
          />
        </div>
      )
    } else if (activeSection === 'settings') {
      setTitle('Configurações')
      setSidebarContent(
        <div className="space-y-4">
          <SidebarCard
            icon={<Download size={18} />}
            title="Download de Exemplos"
            description="Baixe modelos de CSV para criar suas próprias coleções."
          />
        </div>
      )
    } else {
      setTitle('Menu')
      setSidebarContent(null)
    }
  }, [activeSection, currentSection, displayData, setSidebarContent, setTitle])

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      const nextIdx = currentSectionIndex - 1
      dispatch(setCurrentSectionIndex(nextIdx))
      loadVerses(displaySections[nextIdx])
    }
  }

  const handleNext = () => {
    if (currentSectionIndex < displaySections.length - 1) {
      const nextIdx = currentSectionIndex + 1
      dispatch(setCurrentSectionIndex(nextIdx))
      loadVerses(displaySections[nextIdx])
    }
  }

  const handleImport = (data) => {
    setImportedData(data)
    dispatch(setCurrentSectionIndex(0))
  }

  const handleResetToDefault = () => {
    setImportedData(null)
    dispatch(setCurrentSectionIndex(0))
  }

  const handleDownloadExample = (filename) => {
    const url = `/src/assets/examples/${filename}`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Swipe navigation for mobile
  const handleSwipe = useCallback(
    (direction) => {
      const currentIdx = GOSPELS.indexOf(activeGospelTab)
      if (direction === 'left' && currentIdx < GOSPELS.length - 1) {
        dispatch(setActiveGospelTab(GOSPELS[currentIdx + 1]))
      } else if (direction === 'right' && currentIdx > 0) {
        dispatch(setActiveGospelTab(GOSPELS[currentIdx - 1]))
      }
    },
    [activeGospelTab, dispatch]
  )

  const getPassageForGospel = (gospel) => {
    // Use verses library to get book display name
    const bookTitle = getBookDisplayTitle(gospel)

    const passage = currentSection?.passages?.find(
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
    <>
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sections={displaySections}
      />

      <SectionNav
        sections={displaySections}
        currentIndex={currentSectionIndex}
        onSelect={(idx) => dispatch(setCurrentSectionIndex(idx))}
        onPrev={handlePrev}
        onNext={handleNext}
        selectedVersion={selectedVersion}
        onVersionChange={(v) => dispatch(setSelectedVersion(v))}
        versions={BibleVersionEnum}
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
                onTabChange={(tab) => dispatch(setActiveGospelTab(tab))}
                onSwipe={handleSwipe}
                currentSection={currentSection}
                getPassageForGospel={getPassageForGospel}
                highlightedWord={highlightedWord}
                onWordClick={setHighlightedWord}
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
                          highlightedWord={highlightedWord}
                          onWordClick={setHighlightedWord}
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
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Configurações
              </h2>

              {/* Example Downloads */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                    <Download size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Modelos e Exemplos
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Baixe estes exemplos para ver como formatar seus próprios
                  arquivos CSV para importação.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example.file}
                      onClick={() => handleDownloadExample(example.file)}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all group"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {example.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {example.type} File
                        </p>
                      </div>
                      <Download
                        size={16}
                        className="text-slate-400 group-hover:text-indigo-500 transition-colors"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Import Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <FileImport onImport={handleImport} />
              </div>

              {/* Reset to Default */}
              {importedData && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                    Fonte de Dados Atual
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Exibindo:{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {displayData.title}
                    </span>
                  </p>
                  <button
                    onClick={handleResetToDefault}
                    className="px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
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
      <footer className="hidden md:block py-3 px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-xs text-slate-400">
          <p className="font-medium">{displayData.title}</p>
          <div className="flex items-center gap-4">
            <span className="text-indigo-500 font-semibold tracking-wider">
              @TONUSSILABS
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>{displaySections?.length} Seções</span>
          </div>
        </div>
      </footer>
    </>
  )
}

function App() {
  return <ParallelReader />
}

export default App
