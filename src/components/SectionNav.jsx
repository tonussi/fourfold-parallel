import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Type, Sparkles } from 'lucide-react'
import TextAlignmentToggle from './TextAlignmentToggle'

const FONTS = [
  { id: 'dejavu', name: 'DejaVu' },
  { id: 'koine', name: 'Koine' },
  { id: 'sans', name: 'Sans' },
  { id: 'serif', name: 'Serif' },
]

export default function SectionNav({
  sections,
  currentIndex,
  onSelect,
  onPrev,
  onNext,
  selectedVersion,
  onVersionChange,
  versions,
  selectedFont,
  onFontChange,
  textAlignment,
  onTextAlignmentChange,
  onOpenAI,
}) {
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Mobile: Two-row responsive layout */}
      <div className="md:hidden">
        {/* Row 1: Section Selection with Dropdown and Nav buttons */}
        <div className="flex items-center justify-between gap-2 px-3 pt-2">
          {/* Previous Button */}
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                     bg-slate-100 dark:bg-slate-800
                     text-slate-700 dark:text-slate-300
                     disabled:opacity-30 disabled:cursor-not-allowed
                     active:scale-95 transition-all shrink-0"
            aria-label={t('nav.previous')}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Section Selector Dropdown */}
          <div className="relative min-w-0 flex-1">
            <select
              value={currentIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              title={sections[currentIndex]?.title}
              className="w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50
                       py-2 pl-3 pr-10 text-left text-[11px] font-bold text-slate-800
                       shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20
                       dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 dark:focus:border-indigo-500
                       overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {sections.map((section, index) => (
                <option key={section.id} value={index} title={section.title}>
                  {index + 1}. {section.title}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold">
              {currentIndex + 1}/{sections.length}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={currentIndex === sections.length - 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                     bg-slate-100 dark:bg-slate-800
                     text-slate-700 dark:text-slate-300
                     disabled:opacity-30 disabled:cursor-not-allowed
                     active:scale-95 transition-all shrink-0"
            aria-label={t('nav.next')}
          >
            <ChevronRight size={20} />
          </button>

          {/* AI Button (mobile) */}
          {onOpenAI && (
            <button
              onClick={onOpenAI}
              className="w-10 h-10 flex items-center justify-center rounded-xl
                       bg-indigo-100 dark:bg-indigo-900/30
                       text-indigo-600 dark:text-indigo-400
                       hover:bg-indigo-200 dark:hover:bg-indigo-900/50
                       active:scale-95 transition-all shrink-0"
              aria-label="Open AI assistant"
              title="Ask AI"
            >
              <Sparkles size={18} />
            </button>
          )}
        </div>

        {/* Row 2: Secondary Controls (Font, Version and Alignment) */}
        <div className="grid grid-cols-3 items-end gap-2 px-3 py-3 border-t border-slate-100 dark:border-slate-800/50 mt-2">
          {/* Font Selector */}
          <div className="flex min-w-0 flex-col items-center gap-1">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              {t('nav.font')}
            </span>
            <div className="relative w-full">
              <select
                value={selectedFont}
                onChange={(e) => onFontChange(e.target.value)}
                className="w-full appearance-none bg-slate-100 dark:bg-slate-800
                         text-slate-900 dark:text-white 
                         pl-7 pr-2 py-2 rounded-lg text-xs font-bold
                         focus:outline-none border-none cursor-pointer"
                aria-label={t('nav.font')}
              >
                {FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <Type size={12} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              {t('nav.alignment')}
            </span>
            <TextAlignmentToggle
              value={textAlignment}
              onChange={onTextAlignmentChange}
            />
          </div>

          {/* Version Selector */}
          <div className="flex min-w-0 flex-col items-center gap-1">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              {t('nav.version')}
            </span>
            <div className="relative w-full">
              <select
                value={selectedVersion}
                onChange={(e) => onVersionChange(e.target.value)}
                className="w-full appearance-none bg-indigo-50 dark:bg-indigo-900/20
                         text-indigo-600 dark:text-indigo-400 
                         px-2 py-2 rounded-lg text-xs font-bold
                         focus:outline-none border border-indigo-100 dark:border-indigo-800/30 cursor-pointer"
              >
                {Object.entries(versions).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Desktop: Fuller version */}
      <div className="hidden md:block py-4">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center gap-4">
            {/* Previous Button */}
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-xl text-slate-600 hover:bg-slate-100 
                       dark:text-slate-400 dark:hover:bg-slate-800
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
              aria-label={t('nav.previous')}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Section Select */}
            <div className="relative">
              <select
                value={currentIndex}
                onChange={(e) => onSelect(Number(e.target.value))}
                title={sections[currentIndex]?.title}
                className="min-w-[260px] max-w-[min(42vw,420px)] appearance-none rounded-xl border border-slate-200 bg-slate-50
                         py-2.5 pl-4 pr-14 text-left text-sm font-semibold text-slate-800 shadow-sm
                         outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20
                         dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer
                         overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {sections.map((section, index) => (
                  <option key={section.id} value={index} title={section.title}>
                    {index + 1}. {section.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {currentIndex + 1}/{sections.length}
                </span>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={onNext}
              disabled={currentIndex === sections.length - 1}
              className="p-3 rounded-xl text-slate-600 hover:bg-slate-100 
                       dark:text-slate-400 dark:hover:bg-slate-800
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
              aria-label={t('nav.next')}
            >
              <ChevronRight size={24} />
            </button>

            <div className="flex items-end gap-4 ml-4 border-l border-slate-200 dark:border-slate-700 pl-4">
              {/* AI Button (desktop) */}
              {onOpenAI && (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    {t('nav.ai')}
                  </span>
                  <button
                    onClick={onOpenAI}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                    aria-label="Open AI assistant"
                    title="Ask AI about current section"
                  >
                    <Sparkles size={16} />
                    Ask AI
                  </button>
                </div>
              )}

              {/* Font Selector (Desktop) */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  {t('nav.font')}
                </span>
                <div className="relative">
                  <select
                    value={selectedFont}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-slate-800
                             text-slate-700 dark:text-slate-300
                             pl-10 pr-8 py-2 rounded-xl text-sm font-bold
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    {FONTS.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Type size={16} />
                  </div>
                </div>
              </div>

              {/* Version Selector (Desktop) */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  {t('nav.version')}
                </span>
                <select
                  value={selectedVersion}
                  onChange={(e) => onVersionChange(e.target.value)}
                  className="appearance-none bg-indigo-50 dark:bg-indigo-900/20 
                           text-indigo-600 dark:text-indigo-400 
                           px-4 py-2 rounded-xl text-sm font-bold 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 
                           cursor-pointer border border-indigo-100 dark:border-indigo-800/50"
                >
                  {Object.entries(versions).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  {t('nav.alignment')}
                </span>
                <TextAlignmentToggle
                  value={textAlignment}
                  onChange={onTextAlignmentChange}
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-4 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 rounded-full"
              style={{
                width: `${((currentIndex + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
