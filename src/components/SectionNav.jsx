import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, List, Type } from 'lucide-react'

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
}) {
  const { t } = useTranslation()
  const currentSection = sections[currentIndex] || {
    title: t('common.loading'),
    id: 'loading',
  }

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
          <div className="flex-1 min-w-0 relative">
            <select
              value={currentIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="w-full appearance-none bg-slate-100 dark:bg-slate-800 
                       text-slate-900 dark:text-white 
                       pl-3 pr-10 py-2.5 rounded-xl text-xs font-bold 
                       focus:outline-none border-none cursor-pointer truncate text-center"
            >
              {sections.map((section, index) => (
                <option key={section.id} value={index}>
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
        </div>

        {/* Row 2: Secondary Controls (Font and Version) */}
        <div className="flex items-center justify-center gap-4 px-3 py-2 border-t border-slate-100 dark:border-slate-800/50 mt-2">
          {/* Font Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {t('nav.font')}:
            </span>
            <div className="relative">
              <select
                value={selectedFont}
                onChange={(e) => onFontChange(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 
                         text-slate-900 dark:text-white 
                         pl-7 pr-3 py-1.5 rounded-lg text-xs font-bold 
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

          {/* Version Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {t('nav.version')}:
            </span>
            <div className="relative">
              <select
                value={selectedVersion}
                onChange={(e) => onVersionChange(e.target.value)}
                className="appearance-none bg-indigo-50 dark:bg-indigo-900/20 
                         text-indigo-600 dark:text-indigo-400 
                         px-3 py-1.5 rounded-lg text-xs font-bold 
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

        {/* Quick dot navigation */}
        <div className="flex items-center justify-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide max-w-full">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`h-1.5 rounded-full transition-all duration-300 min-w-0 min-h-0 shrink-0 ${
                index === currentIndex
                  ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={t('nav.go_to_section', { index: index + 1 })}
            />
          ))}
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
                className="appearance-none bg-slate-100 dark:bg-slate-800 
                         text-slate-900 dark:text-white 
                         pl-5 pr-14 py-3 rounded-xl text-base font-semibold 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 
                         min-w-[320px] text-center cursor-pointer"
              >
                {sections.map((section, index) => (
                  <option key={section.id} value={index}>
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

            <div className="flex items-center gap-4 ml-4 border-l border-slate-200 dark:border-slate-700 pl-4">
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
