import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NoteActionMenu({ context, onAddNote, onClose }) {
  const { t } = useTranslation()
  const labels = [
    context.sectionTitle,
    context.gospel,
    context.reference,
    context.verse,
    context.word,
  ].filter(Boolean)

  return (
    <div className="fixed bottom-5 right-4 z-[105] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-950/15 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('notes.menu_title')}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {labels.slice(-4).map((label) => (
              <span key={label} className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {label}
              </span>
            ))}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t('common.close')} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={16} />
        </button>
      </div>
      <button type="button" onClick={onAddNote} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-[0.98]">
        <Plus size={17} />
        {t('notes.add')}
      </button>
    </div>
  )
}
