import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SectionNav({ sections, currentIndex, onSelect, onPrev, onNext }) {
  const currentSection = sections[currentIndex]

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4">
          {/* Previous Button */}
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 
                      disabled:cursor-not-allowed dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Previous section"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Section Select */}
          <div className="relative">
            <select
              value={currentIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white 
                        pl-4 pr-12 py-2.5 rounded-lg text-sm font-semibold focus:outline-none 
                        focus:ring-2 focus:ring-indigo-500 min-w-[280px] text-center"
            >
              {sections.map((section, index) => (
                <option key={section.id} value={index}>
                  {index + 1}. {section.title}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <span className="text-xs">{currentIndex + 1}/{sections.length}</span>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={currentIndex === sections.length - 1}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 
                      disabled:cursor-not-allowed dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Next section"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xs mx-auto mt-4 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
