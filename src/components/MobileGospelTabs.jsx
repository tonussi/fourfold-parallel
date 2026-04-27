import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import VerseText from './VerseText'

const GOSPEL_CONFIG = {
  matthew: {
    title: 'Mateus',
    subtitle: 'O Rei',
    color: 'bg-blue-500',
    borderColor: 'border-t-blue-500',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/30',
    textColor: 'text-blue-600',
    darkTextColor: 'dark:text-blue-400',
  },
  mark: {
    title: 'Marcos',
    subtitle: 'O Servo',
    color: 'bg-red-500',
    borderColor: 'border-t-red-500',
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/30',
    textColor: 'text-red-600',
    darkTextColor: 'dark:text-red-400',
  },
  luke: {
    title: 'Lucas',
    subtitle: 'O Filho do Homem',
    color: 'bg-emerald-500',
    borderColor: 'border-t-emerald-500',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-900/30',
    textColor: 'text-emerald-600',
    darkTextColor: 'dark:text-emerald-400',
  },
  john: {
    title: 'João',
    subtitle: 'O Filho de Deus',
    color: 'bg-purple-500',
    borderColor: 'border-t-purple-500',
    lightBg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-900/30',
    textColor: 'text-purple-600',
    darkTextColor: 'dark:text-purple-400',
  },
}

export default function MobileGospelTabs({
  gospels,
  activeTab,
  onTabChange,
  onSwipe,
  currentSection,
  getPassageForGospel,
  highlightedWord,
  onWordClick,
}) {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isSwiping, setIsSwiping] = useState(false)
  const contentRef = useRef(null)
  const currentIndex = gospels.indexOf(activeTab)
  const minSwipeDistance = 50

  // Reset scroll when tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [activeTab, currentSection])

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsSwiping(true)
  }

  const onTouchMove = (e) => {
    if (!isSwiping) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      onSwipe('left')
    } else if (isRightSwipe) {
      onSwipe('right')
    }

    setIsSwiping(false)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      onTabChange(gospels[currentIndex - 1])
    }
  }

  const handleNextTab = () => {
    if (currentIndex < gospels.length - 1) {
      onTabChange(gospels[currentIndex + 1])
    }
  }

  const passage = getPassageForGospel(activeTab)
  const config = GOSPEL_CONFIG[activeTab]

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Compact Tab Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex">
          {gospels.map((gospel) => {
            const gConfig = GOSPEL_CONFIG[gospel]
            const isActive = activeTab === gospel
            return (
              <button
                key={gospel}
                onClick={() => onTabChange(gospel)}
                className={`
                  flex-1 flex flex-col items-center justify-center py-2 px-1
                  transition-all duration-200 min-h-[52px]
                  ${
                    isActive
                      ? `${gConfig.lightBg} ${gConfig.darkBg}`
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <span
                  className={`
                    text-xs font-bold leading-tight
                    ${isActive ? gConfig.textColor : 'text-slate-500 dark:text-slate-400'}
                    ${isActive ? gConfig.darkTextColor : ''}
                  `}
                >
                  {gConfig.title}
                </span>
                <span
                  className={`
                  text-[10px] leading-tight mt-0.5
                  ${isActive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}
                `}
                >
                  {gConfig.subtitle}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${gConfig.color} mt-1`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Swipeable Content Area */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`
          bg-white dark:bg-slate-900 min-h-full
          border-t-4 ${config.borderColor}
        `}
        >
          {/* Header Card */}
          <div
            className={`
            px-4 py-3 border-b border-slate-100 dark:border-slate-800
            ${config.lightBg} ${config.darkBg}
          `}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className={`font-bold text-lg ${config.textColor} ${config.darkTextColor}`}
                >
                  {config.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {config.subtitle}
                </p>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevTab}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50
                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Evangelho anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-medium text-slate-400 min-w-[40px] text-center">
                  {currentIndex + 1}/4
                </span>
                <button
                  onClick={handleNextTab}
                  disabled={currentIndex === gospels.length - 1}
                  className="p-2 rounded-lg text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50
                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Próximo evangelho"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Reference Badge */}
          {passage.reference && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <span
                className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                text-xs font-semibold
                ${config.lightBg} ${config.darkBg}
                ${config.textColor} ${config.darkTextColor}
              `}
              >
                {passage.reference}
              </span>
            </div>
          )}

          {/* Scripture Content */}
          <div className="p-4">
            {passage?.verses?.length > 0 ? (
              <div className="space-y-4">
                {passage.verses.map((verse, index) => (
                  <p
                    key={verse.verse}
                    className="leading-[1.8] text-[15px] text-slate-800 dark:text-slate-200"
                  >
                    <span
                      className={`
                        inline-flex items-center justify-center
                        w-6 h-6 rounded-full text-[10px] font-bold mr-2
                        ${config.lightBg} ${config.darkBg}
                        ${config.textColor} ${config.darkTextColor}
                      `}
                    >
                      {verse.verse}
                    </span>
                    <VerseText 
                      text={verse.text} 
                      highlightedWord={highlightedWord} 
                      onWordClick={onWordClick} 
                    />
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className={`
                  w-16 h-16 rounded-full mb-4 flex items-center justify-center
                  ${config.lightBg} ${config.darkBg}
                `}
                >
                  <span
                    className={`text-2xl ${config.textColor} ${config.darkTextColor}`}
                  >
                    —
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Este evento não está registrado em {config.title}
                </p>
              </div>
            )}
          </div>

          {/* Swipe Hint (shows briefly) */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              ← Deslize para navegar →
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
