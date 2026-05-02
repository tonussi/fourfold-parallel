import { useState, useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  X,
  Edit3,
  Loader2,
} from 'lucide-react'
import { fetchVerses } from '../verses'

export default function FileImport({ onImport }) {
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

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  const normalizeVerses = (versesStr) => {
    if (!versesStr || typeof versesStr !== 'string') return ''
    return versesStr
      .split(/[;\r?\n]+/)
      .map((v) => v.trim())
      .filter((v) => v)
      .join(';')
  }

  // Parse a single verse range like "1:5" or "1:5-10"
  const parseSingleVerseRange = (rangeStr) => {
    const match = rangeStr.trim().match(/^(\d+):(\d+)(?:-(\d+))?$/)
    if (!match) return null

    return {
      chapter: parseInt(match[1], 10),
      startVerse: parseInt(match[2], 10),
      endVerse: match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10),
    }
  }

  // Parse verses format supporting multiple ranges separated by semicolons or newlines
  const parseVersesFormat = (gospel, versesStr) => {
    if (!versesStr) return { reference: '', ranges: [] }

    const lines = versesStr
      .split(/[;\r?\n]+/)
      .map((l) => l.trim())
      .filter((l) => l)
    const bookName = capitalize(gospel)
    const ranges = []

    for (const line of lines) {
      const parsed = parseSingleVerseRange(line)
      if (parsed) {
        ranges.push(parsed)
      }
    }

    if (ranges.length === 0) return { reference: '', ranges: [] }

    const rangeStrs = ranges.map((r) =>
      r.startVerse === r.endVerse
        ? `${r.chapter}:${r.startVerse}`
        : `${r.chapter}:${r.startVerse}-${r.endVerse}`
    )
    const reference = `${bookName} ${rangeStrs.join(';')}`

    return { reference, ranges }
  }

  // Fetch verse content from API
  const fetchVerseContent = async (gospel, versesStr, version = 'BYZ') => {
    const { reference, ranges } = parseVersesFormat(gospel, versesStr)

    if (!reference || ranges.length === 0) {
      return { reference: '', verses: [] }
    }

    const allVerses = []

    for (const range of ranges) {
      const rangeRef =
        range.startVerse === range.endVerse
          ? `${range.chapter}:${range.startVerse}`
          : `${range.chapter}:${range.startVerse}-${range.endVerse}`
      const fullRef = `${capitalize(gospel)} ${rangeRef}`

      try {
        const data = await fetchVerses(fullRef, version)
        if (data.verses && data.verses.length > 0) {
          allVerses.push(...data.verses)
        } else {
          for (let v = range.startVerse; v <= range.endVerse; v++) {
            allVerses.push({ verse: v, text: '[Verse text unavailable]' })
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch verses for ${fullRef}:`, err)
        for (let v = range.startVerse; v <= range.endVerse; v++) {
          allVerses.push({ verse: v, text: '[Verse text unavailable]' })
        }
      }
    }

    return { reference, verses: allVerses }
  }

  const transformImportData = async (data, version = 'BYZ') => {
    if (version === 'BYZ') console.log(data)

    const transformedSections = await Promise.all(
      data.sections.map(async (section) => {
        const passagesWithVerses = await Promise.all(
          section.passages.map(async (passage) => {
            const normalizedVersesStr = normalizeVerses(passage.verses)
            if (!normalizedVersesStr) {
              return { ...passage, reference: '', verses: [] }
            }

            const { reference, verses } = await fetchVerseContent(
              passage.gospel,
              normalizedVersesStr,
              version
            )

            return {
              ...passage,
              reference,
              verses:
                verses.length > 0
                  ? verses.map((v) => ({ verse: v.verse, text: v.text }))
                  : [],
            }
          })
        )

        return {
          ...section,
          passages: passagesWithVerses,
        }
      })
    )

    return {
      ...data,
      sections: transformedSections,
    }
  }

  const validateStructure = (data) => {
    if (!data.title || typeof data.title !== 'string') {
      return { valid: false, error: 'Missing or invalid "title" field' }
    }
    if (!Array.isArray(data.sections)) {
      return { valid: false, error: 'Missing or invalid "sections" array' }
    }
    for (const section of data.sections) {
      if (!section.title) {
        // Fallback title if empty
        section.title = section.title || `Section ${section.id || 'Untitled'}`
      }
      if (!Array.isArray(section.passages)) {
        return {
          valid: false,
          error: `Section "${section.title}" needs a "passages" array`,
        }
      }
    }
    return { valid: true }
  }

  const parseCSV = (content) => {
    const rows = []
    let currentColumn = ''
    let inQuotes = false
    let currentRow = []

    for (let i = 0; i < content.length; i++) {
      const char = content[i]
      const nextChar = content[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentColumn += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentColumn)
        currentColumn = ''
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++
        currentRow.push(currentColumn)
        // Keep row if it has any non-empty column
        if (currentRow.some((c) => c.trim() !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
        currentColumn = ''
      } else {
        currentColumn += char
      }
    }
    if (currentRow.length > 0 || currentColumn !== '') {
      currentRow.push(currentColumn)
      if (currentRow.some((c) => c.trim() !== '')) {
        rows.push(currentRow)
      }
    }

    if (rows.length < 2)
      throw new Error('CSV needs at least a header row and one data row')

    const headers = rows[0].map((h) => h.trim().toLowerCase())
    const sections = []

    const titleIdx = headers.indexOf('title')
    const matthewIdx = headers.indexOf('matthew')
    const markIdx = headers.indexOf('mark')
    const lukeIdx = headers.indexOf('luke')
    const johnIdx = headers.indexOf('john')

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i]
      const sectionTitle = values[titleIdx]?.trim() || `Sessão ${i}`

      // Allow row even if title is empty, as long as there is some verse data
      const hasData = [matthewIdx, markIdx, lukeIdx, johnIdx].some(
        (idx) => idx !== -1 && values[idx]?.trim()
      )

      if (!hasData && !values[titleIdx]?.trim()) continue

      const sectionId = `section-${i}`

      sections.push({
        id: sectionId,
        title: sectionTitle,
        passages: [
          {
            gospel: 'matthew',
            verses:
              matthewIdx !== -1 ? normalizeVerses(values[matthewIdx]) : '',
          },
          {
            gospel: 'mark',
            verses: markIdx !== -1 ? normalizeVerses(values[markIdx]) : '',
          },
          {
            gospel: 'luke',
            verses: lukeIdx !== -1 ? normalizeVerses(values[lukeIdx]) : '',
          },
          {
            gospel: 'john',
            verses: johnIdx !== -1 ? normalizeVerses(values[johnIdx]) : '',
          },
        ],
      })
    }

    return {
      title: 'Leitura Paralela Personalizada',
      sections,
    }
  }

  const processTextInput = async () => {
    if (!textContent.trim()) {
      setError('Por favor, insira algum conteúdo')
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
      const data = await transformImportData(csvData)

      setSuccess(
        `Sucesso: "${data.title}" carregado com ${data.sections.length} sessões`
      )
      onImport(data)
      closeTextInput()
    } catch (err) {
      setError(err.message || 'Erro ao processar CSV')
    } finally {
      setLoading(false)
    }
  }

  const processFile = async (file) => {
    resetStatus()
    setLoading(true)

    const extension = file.name.split('.').pop().toLowerCase()
    if (extension !== 'csv') {
      setError('Por favor, envie um arquivo .csv')
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
      const data = await transformImportData(csvData)

      setSuccess(
        `Sucesso: "${data.title}" carregado com ${data.sections.length} sessões`
      )
      onImport(data)
    } catch (err) {
      setError(err.message || 'Erro ao processar arquivo')
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
        <h3 className="font-semibold text-lg">Importar Versículos Paralelos</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Importe seus próprios versículos paralelos usando um arquivo CSV.
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
            {loading
              ? 'Processando...'
              : 'Arraste um arquivo CSV ou clique para navegar'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Formato: Title, Matthew, Mark, Luke, John
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
        Colar Conteúdo CSV
      </button>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-all">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Colar Conteúdo CSV
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
                Cancelar
              </button>
              <button
                onClick={processTextInput}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Importar CSV
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
            <p className="text-sm font-semibold">Falha na importação</p>
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
            <p className="text-sm font-semibold">Importação concluída</p>
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
          Formato de Arquivo Esperado:
        </p>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono leading-relaxed">
            Title,Matthew,Mark,Luke,John
            <br />
            O Pregador,"3:7-10;3:11-12",1:7-8,"3:7-9;3:15-18",
            <br />
            Tentações,4:1-11,,4:1-13,
          </div>
          <p className="mt-3 leading-relaxed">
            * Use ponto e vírgula (;) ou novas linhas para separar múltiplos
            intervalos de versículos em uma mesma célula.
          </p>
        </div>
      </div>
    </div>
  )
}
