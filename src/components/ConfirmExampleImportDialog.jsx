import { FileSpreadsheet, Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ConfirmExampleImportDialog({
  example,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation()

  if (!example) return null

  const handleBackdropClick = (event) => {
    if (!loading && event.target === event.currentTarget) onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="example-import-title"
      aria-describedby="example-import-description"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4 p-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
            <FileSpreadsheet size={24} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="example-import-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              {t('import.example_confirm_title')}
            </h3>
            <p
              id="example-import-description"
              className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
            >
              {t('import.example_confirm_description', {
                name: example.name,
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label={t('common.close')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {example.name}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {example.file}
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t('import.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : null}
            {loading
              ? t('import.processing')
              : t('import.example_confirm_action')}
          </button>
        </div>
      </div>
    </div>
  )
}
