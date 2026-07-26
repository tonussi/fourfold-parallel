import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  X,
  Edit3,
  Loader2,
} from 'lucide-react'
import { parseCSV, validateStructure } from '@src/utils/importUtils'

export default function FileImport({ onImport }) {
  const { t } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textContent, setTextContent] = useState('')
  const fileInputRef = useRef(null)

  const resetStatus = () => {
    setError(null)
    setSuccess(null)
  }

  const openTextInput = () => {
    setTextContent('')
    setShowTextInput(true)
    resetStatus()
  }

  const closeTextInput = () => {
    setShowTextInput(false)
    setTextContent('')
  }

  const processTextInput = async () => {
    if (!textContent.trim()) {
      setError(t('common.error') || 'Error')
      return
    }

    setLoading(true)
    resetStatus()

    try {
      const csvData = parseCSV(textContent)
      const validation = validateStructure(csvData)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      setSuccess(`${t('common.success') || 'Imported'}: "${csvData.title}"`)
      onImport(csvData)
      closeTextInput()
    } catch (err) {
      setError(err.message || t('import.error_title') || 'Import Error')
    } finally {
      setLoading(false)
    }
  }

  const processFile = async (file) => {
    resetStatus()
    setLoading(true)

    const extension = file.name.split('.').pop().toLowerCase()
    if (extension !== 'csv') {
      setError(t('import.error_title') || 'Import Error')
      setLoading(false)
      return
    }

    try {
      const content = await file.text()
      const csvData = parseCSV(content)
      const validation = validateStructure(csvData)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      setSuccess(`${t('common.success') || 'Imported'}: "${csvData.title}"`)
      onImport(csvData)
    } catch (err) {
      setError(err.message || t('import.error_title') || 'Import Error')
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
        <Upload size={20} />
        <h3 className="font-semibold text-lg">{t('import.title')}</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t('import.description')}
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-10
          transition-all duration-300 flex flex-col items-center gap-4
          ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/50'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
          <FileSpreadsheet size={40} className="text-indigo-500" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-slate-700 dark:text-slate-300">
            {loading ? t('import.processing') : t('import.drag_drop')}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            {t('import.format_help')}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />
      </div>

      {/* Text Input Button */}
      <button
        onClick={openTextInput}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
      >
        <Edit3 size={18} />
        {t('import.paste_csv')}
      </button>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-all">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {t('import.paste_csv')}
              </h4>
              <button
                onClick={closeTextInput}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Title,Matthew,Mark,Luke,John&#10;O Nascimento,1:18-25,,2:1-20,"
                className="w-full h-80 p-4 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                spellCheck={false}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={closeTextInput}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {t('import.cancel')}
              </button>
              <button
                onClick={processTextInput}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {t('import.import_button')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{t('import.error_title')}</p>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={resetStatus}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <Check size={20} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{t('import.success_title')}</p>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">{success}</p>
          </div>
          <button
            onClick={resetStatus}
            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* File Format Help */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
          {t('import.expected_format')}
        </p>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono leading-relaxed">
            Title,Matthew,Mark,Luke,John
            <br />
            O Pregador,"3:7-10;3:11-12",1:7-8,"3:7-9;3:15-18",
            <br />
            Tentações,4:1-11,,4:1-13,
          </div>
          <p className="mt-3 leading-relaxed">{t('import.format_note')}</p>
        </div>
      </div>
    </div>
  )
}
