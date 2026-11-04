import { useEffect, useMemo, useState } from 'react'
import { Brain, ExternalLink, Save, Trash2, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { deleteNote, saveNote, selectNotes } from '@src/store'
import { buildNoteContextId } from '@src/utils/noteUtils'

const buildPrompt = (note) =>
  [
    'Ajude-me a estudar esta anotação bíblica.',
    `Título da sessão: ${note.sectionTitle}`,
    `Evangelho: ${note.gospel}`,
    `Referência: ${note.reference || 'não informada'}`,
    `Versículo: ${note.verse || 'não informado'}`,
    `Palavra selecionada: ${note.word || 'nenhuma'}`,
    `Nota: ${note.text}`,
  ].join('\n')

export default function NoteEditor({ context, onClose }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const notes = useSelector(selectNotes)
  const noteKey = buildNoteContextId(context)
  const existingNote = useMemo(
    () => notes.find((note) => note.contextId === noteKey),
    [notes, noteKey]
  )
  const [text, setText] = useState(existingNote?.text || '')

  useEffect(() => {
    setText(existingNote?.text || '')
  }, [existingNote])

  const note = {
    ...context,
    contextId: noteKey,
    text: text.trim(),
    id: existingNote?.id,
  }

  const save = () => {
    if (!note.text) return
    dispatch(saveNote(note))
    onClose()
  }

  const openAssistant = (url) => {
    if (!note.text) return
    window.open(`${url}${encodeURIComponent(buildPrompt(note))}`, '_blank', 'noopener,noreferrer')
  }

  const remove = () => {
    if (existingNote) dispatch(deleteNote(existingNote.id))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('notes.title')}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[context.sectionTitle, context.gospel, context.reference, context.verse, context.word]
                .filter(Boolean)
                .map((label) => (
                  <span key={label} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {label}
                  </span>
                ))}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <textarea
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('notes.placeholder')}
            className="min-h-36 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={() => openAssistant('https://claude.ai/new?q=')} disabled={!text.trim()} className="flex items-center gap-1.5 rounded-xl border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 disabled:opacity-40 dark:border-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-950/30" title={t('notes.open_claude')}>
                <Brain size={15} /> Claude
              </button>
              <button type="button" onClick={() => openAssistant('https://chatgpt.com/?q=')} disabled={!text.trim()} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-950/30" title={t('notes.open_chatgpt')}>
                <ExternalLink size={15} /> ChatGPT
              </button>
            </div>
            <div className="flex gap-2">
              {existingNote && <button type="button" onClick={remove} className="rounded-xl p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label={t('notes.delete')}><Trash2 size={17} /></button>}
              <button type="button" onClick={save} disabled={!text.trim()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-40"><Save size={16} />{t('notes.save')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
