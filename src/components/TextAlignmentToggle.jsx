import { AlignJustify, AlignLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function TextAlignmentToggle({ value, onChange }) {
  const { t } = useTranslation()
  const isJustified = value === 'justify'
  const nextValue = isJustified ? 'left' : 'justify'
  const actionLabel = isJustified
    ? t('nav.align_left')
    : t('nav.align_justify')
  const Icon = isJustified ? AlignJustify : AlignLeft

  return (
    <button
      type="button"
      onClick={() => onChange(nextValue)}
      aria-label={actionLabel}
      aria-pressed={isJustified}
      title={actionLabel}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
        isJustified
          ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-800/60 dark:bg-indigo-900/30 dark:text-indigo-300'
          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300'
      }`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="sr-only">{t('nav.text_alignment')}</span>
    </button>
  )
}
