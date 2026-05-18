import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'

export default function SearchSection() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center h-[calc(100vh-220px)] md:h-[calc(100vh-200px)]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('common.search')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {t('app.search_description')}
        </p>
        <a
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          <Search className="w-5 h-5" />
          {t('app.open_search')}
        </a>
      </div>
    </div>
  )
}
