import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, List, Type } from 'lucide-react'

const FONTS = [
  { id: 'serif', name: 'Serif' },
  { id: 'sans', name: 'Sans' },
  { id: 'dejavu', name: 'DejaVu' },
  { id: 'koine', name: 'Koine' },
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
      {/* Mobile: Ultra-compact version */}
      <div className="md:hidden">
        <div className="flex items-center gap-1 px-2 py-2">
          {/* Previous Button */}
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                     bg-slate-100 dark:bg-slate-800 
                     text-slate-700 dark:text-slate-300
                     disabled:opacity-30 disabled:cursor-not-allowed
                     active:scale-95 transition-all"
            aria-label={t('nav.previous')}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Section Title Display */}
          <div className="flex-1 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
              {t('nav.passage')}
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate px-2">
              {currentIndex + 1}. {currentSection.title}
            </h3>
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-1">
            {/* Font Selector (Mobile) */}
            <div className="relative">
              <select
                value={selectedFont}
                onChange={(e) => onFontChange(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 
                         text-slate-900 dark:text-white 
                         pl-2 pr-1 py-2 rounded-lg text-[10px] font-bold 
                         focus:outline-none border-none cursor-pointer w-8"
                aria-label={t('nav.font')}
              >
                {FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name.charAt(0)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Type size={12} className="text-slate-500" />
              </div>
            </div>

            {/* Version Selector (Mobile) */}
            <div>
              <select
                value={selectedVersion}
                onChange={(e) => onVersionChange(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 
                         text-slate-900 dark:text-white 
                         px-2 py-2 rounded-lg text-[10px] font-bold 
                         focus:outline-none border-none cursor-pointer"
              >
                {Object.entries(versions).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key}
                  </option>
                ))}
              </select>
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
                     active:scale-95 transition-all"
            aria-label={t('nav.next')}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Quick dot navigation */}
        <div className="flex items-center justify-center gap-1.5 px-4 pb-2">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
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
