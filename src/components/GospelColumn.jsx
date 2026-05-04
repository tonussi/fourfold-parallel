import { useTranslation } from 'react-i18next'
import { ScrollText, BookOpen, Bookmark, Share2 } from 'lucide-react'
import VerseText from './VerseText'

export default function GospelColumn({
  gospel,
  reference,
  verses,
  highlightedWord,
  onWordClick,
}) {
  const { t } = useTranslation()

  const gospelConfig = {
    matthew: {
      title: t('common.matthew'),
      subtitle: t('gospels.matthew_subtitle'),
      color: 'border-t-4 border-t-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    mark: {
      title: t('common.mark'),
      subtitle: t('gospels.mark_subtitle'),
      color: 'border-t-4 border-t-red-500',
      bg: 'bg-red-50 dark:bg-red-950/30',
      iconBg: 'bg-red-100 dark:bg-red-900/50',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    luke: {
      title: t('common.luke'),
      subtitle: t('gospels.luke_subtitle'),
      color: 'border-t-4 border-t-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    john: {
      title: t('common.john'),
      subtitle: t('gospels.john_subtitle'),
      color: 'border-t-4 border-t-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  }

  const config = gospelConfig[gospel]

  return (
    <div className={`gospel-column ${config.color} h-full`}>
      {/* Header */}
      <div
        className={`gospel-header ${config.bg} flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.iconBg}`}>
            <BookOpen className={config.iconColor} size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {config.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 
                           dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <Bookmark size={16} />
          </button>
          <button
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 
                           dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Reference Header */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        {reference ? (
          <div className="flex items-center gap-2 text-sm">
            <ScrollText size={14} className={config.iconColor} />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {reference}
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic">
            {t('gospels.no_parallel')}
          </span>
        )}
      </div>

      {/* Verses Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4">
        {verses.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {verses.map((verse, index) => (
              <p
                key={verse.verse}
                className={`
                  verse-text text-[14px] sm:text-[15px] leading-[1.7] sm:leading-[1.8]
                  ${
                    index > 0
                      ? 'pt-3 border-t border-slate-100 dark:border-slate-800/50'
                      : ''
                  }
                `}
              >
                <sup className={`font-bold mr-1 text-xs ${config.iconColor}`}>
                  {verse.verse}
                </sup>
                <VerseText
                  text={verse.text}
                  highlightedWord={highlightedWord}
                  onWordClick={onWordClick}
                />
              </p>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
            <div className={`p-4 rounded-full ${config.iconBg} mb-4`}>
              <ScrollText className={config.iconColor} size={32} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t('gospels.not_recorded', { title: config.title })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
