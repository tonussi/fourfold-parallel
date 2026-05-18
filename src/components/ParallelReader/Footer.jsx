import { useTranslation } from 'react-i18next'

export default function Footer({ displayDataTitle, sectionsCount }) {
  const { t } = useTranslation()

  return (
    <footer className="hidden md:block py-3 px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between text-xs text-slate-400">
        <p className="font-medium">{displayDataTitle}</p>
        <div className="flex items-center gap-4">
          <span className="text-indigo-500 font-semibold tracking-wider">
            @TLABS{' '}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span>{t('app.sections_count', { count: sectionsCount })}</span>
        </div>
      </div>
    </footer>
  )
}
