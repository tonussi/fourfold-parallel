import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  X,
  Sparkles,
  ExternalLink,
  ClipboardCopy,
  Save,
  Trash2,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-react'
import {
  selectProviders,
  selectPrompts,
  selectActiveProviderId,
  selectActivePromptId,
  selectActiveProvider,
  selectActivePrompt,
  setActiveProvider,
  setActivePrompt,
  addPrompt,
  removePrompt,
  addProvider,
} from '@src/store'

function buildSectionText(section) {
  if (!section?.passages) return ''
  return section.passages
    .map((p) => {
      const ref = p.reference || ''
      const rawVerses = p.verses
      const verses = Array.isArray(rawVerses)
        ? rawVerses
            .map((v) => {
              if (typeof v === 'string') return v
              if (v && typeof v === 'object') {
                const num = v.verse ?? v.number ?? ''
                const text = v.text ?? v.scripture ?? ''
                return num ? `[${num}] ${text}` : text
              }
              return ''
            })
            .filter(Boolean)
            .join(' ')
        : typeof rawVerses === 'string'
          ? rawVerses
          : ''
      return `${p.gospel?.toUpperCase() || ''} ${ref}\n${verses}`.trim()
    })
    .filter(Boolean)
    .join('\n\n')
}

function buildPayload(prompt, section) {
  const sectionText = buildSectionText(section)
  if (!sectionText) return prompt
  return `${prompt}\n\n--- Verses ---\n\n${sectionText}`
}

export default function AIModal({ isOpen, onClose, currentSection }) {
  const dispatch = useDispatch()
  const providers = useSelector(selectProviders)
  const prompts = useSelector(selectPrompts)
  const activeProviderId = useSelector(selectActiveProviderId)
  const activePromptId = useSelector(selectActivePromptId)
  const activeProvider = useSelector(selectActiveProvider)
  const activePrompt = useSelector(selectActivePrompt)

  const [promptText, setPromptText] = useState('')
  const [newProviderName, setNewProviderName] = useState('')
  const [newProviderUrl, setNewProviderUrl] = useState('')
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [saveLabel, setSaveLabel] = useState('')
  const [status, setStatus] = useState(null) // {type:'success'|'error', msg}

  // Sync textarea when active prompt changes via dropdown (derived from prop)
  const activePromptText = activePrompt?.text || ''
  const [lastSyncedPromptId, setLastSyncedPromptId] = useState(activePromptId)
  if (activePromptId !== lastSyncedPromptId && activePromptId) {
    setLastSyncedPromptId(activePromptId)
    setPromptText(activePromptText)
  }

  // Auto-clear status after 3s
  useEffect(() => {
    if (!status) return
    const t = setTimeout(() => setStatus(null), 3000)
    return () => clearTimeout(t)
  }, [status])

  const payload = useMemo(
    () => buildPayload(promptText, currentSection),
    [promptText, currentSection]
  )

  const hasVerses = (currentSection?.passages || []).some(
    (p) => p.verses && p.verses.length > 0
  )

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!activeProvider) {
      setStatus({ type: 'error', msg: 'Pick an AI provider first' })
      return
    }
    if (!promptText.trim()) {
      setStatus({ type: 'error', msg: 'Prompt is empty' })
      return
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload)
      }
      // Try to pre-fill via query string. Most AI web UIs ignore this,
      // but a few (e.g. ChatGPT) accept it. Fallback is the clipboard.
      const u = new URL(activeProvider.url)
      u.searchParams.set('q', payload)
      const targetUrl = u.toString()
      const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer')
      setStatus({
        type: 'success',
        msg: opened
          ? 'Opened AI tab + copied to clipboard. Press Ctrl+V to paste if needed.'
          : 'Popup blocked. Prompt copied to clipboard — paste manually.',
      })
    } catch {
      setStatus({ type: 'error', msg: 'Failed to open AI or copy' })
    }
  }

  const handleSavePrompt = () => {
    if (!promptText.trim()) return
    const id = `prompt-${Date.now()}`
    dispatch(
      addPrompt({
        id,
        label: saveLabel.trim() || promptText.slice(0, 40),
        text: promptText,
      })
    )
    setSaveLabel('')
    setStatus({ type: 'success', msg: 'Prompt saved' })
  }

  const handleAddProvider = () => {
    const name = newProviderName.trim()
    const url = newProviderUrl.trim()
    if (!name || !url) return
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    dispatch(addProvider({ id, name, url }))
    setNewProviderName('')
    setNewProviderUrl('')
    setShowAddProvider(false)
    dispatch(setActiveProvider(id))
    setStatus({ type: 'success', msg: `Provider ${name} added` })
  }

  const handleRemovePrompt = (id) => {
    dispatch(removePrompt(id))
    setStatus({ type: 'success', msg: 'Prompt removed' })
  }

  const handlePromptChange = (e) => {
    const id = e.target.value
    dispatch(setActivePrompt(id))
    const p = prompts.find((x) => x.id === id)
    if (p) setPromptText(p.text)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        <div className="relative p-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-indigo-600" />
            Ask AI
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Send current section to an AI with your prompt.
            {currentSection?.title && (
              <span className="block mt-1 font-semibold text-slate-700 dark:text-slate-300">
                Section: {currentSection.title}
              </span>
            )}
          </p>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {status && (
            <div
              className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-300'
              }`}
            >
              {status.type === 'success' ? (
                <Check size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {status.msg}
            </div>
          )}

          {/* AI Provider dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              AI Provider
            </label>
            <div className="flex gap-2">
              <select
                value={activeProviderId}
                onChange={(e) => dispatch(setActiveProvider(e.target.value))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddProvider((v) => !v)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Add AI provider"
                title="Add AI provider"
              >
                <Plus size={18} />
              </button>
            </div>
            {showAddProvider && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Perplexity)"
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="url"
                  placeholder="URL (e.g. https://perplexity.ai)"
                  value={newProviderUrl}
                  onChange={(e) => setNewProviderUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddProvider(false)}
                    className="px-3 py-1.5 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProvider}
                    className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved prompts dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Saved Prompt
            </label>
            <div className="flex gap-2">
              <select
                value={activePromptId}
                onChange={handlePromptChange}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              {activePromptId &&
                !activePromptId.startsWith('example-') &&
                prompts.find((p) => p.id === activePromptId) && (
                  <button
                    type="button"
                    onClick={() => handleRemovePrompt(activePromptId)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                    aria-label="Remove prompt"
                    title="Remove prompt"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
            </div>
          </div>

          {/* Editable prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Prompt (editable)
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm"
              placeholder="Write or pick a prompt..."
            />
            <div className="mt-2 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Label (optional)"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleSavePrompt}
                disabled={!promptText.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1"
              >
                <Save size={14} />
                Save
              </button>
            </div>
          </div>

          {/* Preview payload */}
          <details className="text-xs">
            <summary className="cursor-pointer text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
              Preview payload ({payload.length} chars)
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
              {payload}
            </pre>
          </details>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!promptText.trim() || !activeProvider}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ExternalLink size={16} />
            Open in {activeProvider?.name || 'AI'}
            <ClipboardCopy size={14} className="opacity-70" />
          </button>
        </div>
      </div>
    </div>
  )
}
