import { useTranslation } from 'react-i18next'

export default function BookmarksSection() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center h-[calc(100vh-220px)] md:h-[calc(100vh-200px)]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('common.bookmarks')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {t('app.bookmarks_description')}
        </p>
      </div>
    </div>
  )
}
