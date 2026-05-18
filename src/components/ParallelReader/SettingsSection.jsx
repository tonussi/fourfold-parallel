import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import FileImport from '@src/components/FileImport'
import { EXAMPLES, transformData } from '@src/utils/bibleHelpers'
import parallelData from '@src/data/parallelVerses.json'
import {
  selectImportedData,
  setImportedData,
  setCurrentSectionIndex,
  purgePersistence,
} from '@src/store'

export default function SettingsSection() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const importedData = useSelector(selectImportedData)

  const displayData = useMemo(
    () => importedData || transformData(parallelData),
    [importedData]
  )

  const handleImport = (data) => {
    dispatch(setImportedData(data))
    dispatch(setCurrentSectionIndex(0))
  }

  const handleResetToDefault = () => {
    dispatch(setImportedData(null))
    dispatch(setCurrentSectionIndex(0))
  }

  const handleResetApp = async () => {
    if (
      confirm(
        t('settings.reset_confirm') ||
          'Are you sure you want to reset the app? This will clear all session data.'
      )
    ) {
      await purgePersistence()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  const handleDownloadExample = (filename) => {
    const url = `/src/assets/examples/${filename}`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] overflow-y-auto p-4 lg:p-6 mb-16 md:mb-0">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {t('common.settings')}
        </h2>

        {/* Example Downloads */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
              <Download size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('app.examples_title')}
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t('app.examples_description')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLES.map((example) => (
              <button
                key={example.file}
                onClick={() => handleDownloadExample(example.file)}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {example.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {example.type} File
                  </p>
                </div>
                <Download
                  size={16}
                  className="text-slate-400 group-hover:text-indigo-500 transition-colors"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <FileImport onImport={handleImport} />
        </div>

        {/* Reset to Default */}
        {importedData && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              {t('app.current_data_source')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t('app.displaying')}:{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {displayData.title}
              </span>
            </p>
            <button
              onClick={handleResetToDefault}
              className="px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
            >
              {t('app.restore_default')}
            </button>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/20 p-6 shadow-sm">
          <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">
            {t('settings.danger_zone') || 'Danger Zone'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {t('settings.reset_description') ||
              'This will clear all your session data, including bookmarks, history, and custom settings.'}
          </p>
          <button
            onClick={handleResetApp}
            className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all active:scale-95 shadow-md shadow-red-500/20"
          >
            {t('settings.reset_app') || 'Reset App'}
          </button>
        </div>
      </div>
    </div>
  )
}
