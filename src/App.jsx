import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useSidebar } from '@src/contexts/SidebarContext'
import Header from '@src/components/Header'
import SectionNav from '@src/components/SectionNav'
import { SidebarCard } from '@src/components/Sidebar'
import StatisticsPage from '@src/pages/Statistics/StatisticsPage'
import { parseReference, fetchVerses, BibleVersionEnum } from '@src/verses'
import { BookOpen, FileText, Download, BarChart3 } from 'lucide-react'
import parallelData from '@src/data/parallelVerses.json'
import {
  selectCurrentVersion,
  selectCurrentSectionIndex,
  selectActiveGospelTab,
  setSelectedVersion,
  setCurrentSectionIndex,
  setActiveGospelTab,
  selectSelectedFont,
  setSelectedFont,
  selectImportedData,
} from '@src/store'

// Refactored helper functions, subcomponents, and constants
import {
  GOSPELS,
  transformData,
} from '@src/utils/bibleHelpers'
import ReaderSection from '@src/components/ParallelReader/ReaderSection'
import SearchSection from '@src/components/ParallelReader/SearchSection'
import BookmarksSection from '@src/components/ParallelReader/BookmarksSection'
import SettingsSection from '@src/components/ParallelReader/SettingsSection'
import Footer from '@src/components/ParallelReader/Footer'
import './App.css'

function ParallelReader() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [activeSection, setActiveSection] = useState('read')
  const [isMobile, setIsMobile] = useState(false)
  const [sectionVerses, setSectionVerses] = useState({})
  const [isLoadingVerses, setIsLoadingVerses] = useState(false)
  const [highlightedWord, setHighlightedWord] = useState(null)
  const { setSidebarContent, setTitle } = useSidebar()

  const GOSPEL_CONFIG = useMemo(
    () => ({
      matthew: {
        title: t('common.matthew', { defaultValue: 'Matthew' }),
        color: 'bg-blue-500',
      },
      mark: {
        title: t('common.mark', { defaultValue: 'Mark' }),
        color: 'bg-red-500',
      },
      luke: {
        title: t('common.luke', { defaultValue: 'Luke' }),
        color: 'bg-emerald-500',
      },
      john: {
        title: t('common.john', { defaultValue: 'John' }),
        color: 'bg-purple-500',
      },
    }),
    [t]
  )

  // Redux state
  const selectedVersion = useSelector(selectCurrentVersion)
  const currentSectionIndex = useSelector(selectCurrentSectionIndex)
  const activeGospelTab = useSelector(selectActiveGospelTab)
  const selectedFont = useSelector(selectSelectedFont)
  const importedData = useSelector(selectImportedData)

  // Update verse font CSS variable when selected font changes
  useEffect(() => {
    const fontMap = {
      serif: 'var(--font-serif)',
      sans: 'var(--font-sans)',
      dejavu: 'var(--font-dejavu)',
      koine: 'var(--font-koine)',
    }
    document.documentElement.style.setProperty(
      '--verse-font-family',
      fontMap[selectedFont] || fontMap.serif
    )
  }, [selectedFont])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Use imported data if available, otherwise use default (transformed)
  const displayData = useMemo(
    () => importedData || transformData(parallelData),
    [importedData]
  )
  const displaySections = displayData.sections
  const currentSection = displaySections[currentSectionIndex] || {
    title: t('common.loading'),
    id: 'loading',
  }

  const loadVerses = useCallback(
    async (section) => {
      if (!section?.passages) return
      setIsLoadingVerses(true)
      setSectionVerses({}) // Clear old verses
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

  // Initial load and reload when data source or section changes
  useEffect(() => {
    if (displaySections && displaySections[currentSectionIndex]) {
      loadVerses(displaySections[currentSectionIndex])
    }
  }, [currentSectionIndex, loadVerses, displaySections])

  useEffect(() => {
    if (activeSection === 'read') {
      setTitle(currentSection?.title || t('common.read'))
      setSidebarContent(
        <div className="space-y-4">
          <SidebarCard
            icon={<BookOpen size={18} />}
            title={t('app.current_session')}
            description={currentSection?.title || t('common.loading')}
          />
          <SidebarCard
            icon={<FileText size={18} />}
            title={t('app.source')}
            description={displayData.title}
          />
          <button
            onClick={() => setActiveSection('statistics')}
            className="w-full mt-4 flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <BarChart3
              size={18}
              className="text-indigo-600 dark:text-indigo-400"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {t('common.statistics')}
              </p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400">
                {t('app.word_sequences')}
              </p>
            </div>
          </button>
        </div>
      )
    } else if (activeSection === 'settings') {
      setTitle(t('common.settings'))
      setSidebarContent(
        <div className="space-y-4">
          <SidebarCard
            icon={<Download size={18} />}
            title={t('app.examples_title')}
            description={t('app.examples_description')}
          />
        </div>
      )
    } else {
      setTitle(t('common.read'))
      setSidebarContent(null)
    }
  }, [activeSection, currentSectionIndex, displayData?.title, t])

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

  // Merge current section with fetched verses
  const mergedCurrentSection = useMemo(() => {
    if (!currentSection?.passages) return currentSection
    return {
      ...currentSection,
      passages: currentSection.passages.map((passage) => ({
        ...passage,
        verses: sectionVerses[passage.gospel] || passage.verses || [],
      })),
    }
  }, [currentSection, sectionVerses])

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
        selectedFont={selectedFont}
        onFontChange={(f) => dispatch(setSelectedFont(f))}
      />

      <main className="flex-1 overflow-hidden">
        {activeSection === 'statistics' && (
          <StatisticsPage
            currentSection={mergedCurrentSection}
            selectedVersion={selectedVersion}
            onBack={() => setActiveSection('read')}
          />
        )}
        {activeSection === 'read' && (
          <div className="h-full flex flex-col">
            <ReaderSection
              isMobile={isMobile}
              activeGospelTab={activeGospelTab}
              gospelConfig={GOSPEL_CONFIG}
              onTabChange={(tab) => dispatch(setActiveGospelTab(tab))}
              onSwipe={handleSwipe}
              currentSection={currentSection}
              getPassageForGospel={getPassageForGospel}
              highlightedWord={highlightedWord}
              onWordClick={setHighlightedWord}
              loading={isLoadingVerses}
            />
          </div>
        )}

        {activeSection === 'search' && <SearchSection />}

        {activeSection === 'bookmarks' && <BookmarksSection />}

        {activeSection === 'settings' && <SettingsSection />}
      </main>

      <Footer
        displayDataTitle={displayData.title}
        sectionsCount={displaySections?.length}
      />
    </>
  )
}

function App() {
  return <ParallelReader />
}

export default App
