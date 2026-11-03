import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'

export default function LoadFailedNotice({ onRetry }) {
  const { t } = useTranslation()

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-4 sm:p-6">
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        {t('gospels.load_failed')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <RefreshCw size={14} />
        {t('gospels.retry')}
      </button>
    </div>
  )
}
