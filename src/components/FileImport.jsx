import { useState, useRef } from 'react'
import {
  Upload,
  FileJson,
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
  const [textInputMode, setTextInputMode] = useState(null) // 'json' or 'csv'
  const [textContent, setTextContent] = useState('')
  const fileInputRef = useRef(null)

  const resetStatus = () => {
    setError(null)
    setSuccess(null)
  }

  const openTextInput = (mode) => {
    setTextInputMode(mode)
    setTextContent('')
    setShowTextInput(true)
    resetStatus()
  }

  const closeTextInput = () => {
    setShowTextInput(false)
    setTextInputMode(null)
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
  // e.g., "10:1;10:7-11;10:14" or "3:7-10\n3:11-12"
  const parseVersesFormat = (gospel, versesStr) => {
    if (!versesStr) return { reference: '', ranges: [] }

    // Split by semicolons or newlines to handle multiple verse references
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

    // Build reference string from all ranges
    const rangeStrs = ranges.map((r) =>
      r.startVerse === r.endVerse
        ? `${r.chapter}:${r.startVerse}`
        : `${r.chapter}:${r.startVerse}-${r.endVerse}`
    )
    const reference = `${bookName} ${rangeStrs.join(';')}`

    return { reference, ranges }
  }

  // Fetch verse content from API
  const fetchVerseContent = async (gospel, versesStr, version = 'ACF') => {
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
          // Fallback: generate empty verses for this range
          for (let v = range.startVerse; v <= range.endVerse; v++) {
            allVerses.push({ verse: v, text: '[Verse text unavailable]' })
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch verses for ${fullRef}:`, err)
        // Fallback: generate empty verses for this range
        for (let v = range.startVerse; v <= range.endVerse; v++) {
          allVerses.push({ verse: v, text: '[Verse text unavailable]' })
        }
      }
    }

    return { reference, verses: allVerses }
  }

  // Transform imported data to include full verse arrays with fetched content
  const transformImportData = async (data, version = 'ACF') => {
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
    // Validate the imported data structure
    if (!data.title || typeof data.title !== 'string') {
      return { valid: false, error: 'Missing or invalid "title" field' }
    }
    if (!Array.isArray(data.sections)) {
      return { valid: false, error: 'Missing or invalid "sections" array' }
    }
    for (const section of data.sections) {
      if (!section.id || !section.title) {
        return { valid: false, error: 'Each section needs an "id" and "title"' }
      }
      if (!Array.isArray(section.passages)) {
        return {
          valid: false,
          error: `Section "${section.title}" needs a "passages" array`,
        }
      }
      for (const passage of section.passages) {
        if (!passage.gospel) {
          return { valid: false, error: 'Each passage needs a "gospel" field' }
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
        if (currentRow.some((c) => c.trim() !== '') || currentRow.length > 1) {
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
      rows.push(currentRow)
    }

    if (rows.length < 2)
      throw new Error('CSV needs at least a header row and one data row')

    const headers = rows[0].map((h) => h.trim().toLowerCase())
    const sections = []

    // New format: each row has Title, Matthew, Mark, Luke, John columns
    const titleIdx = headers.indexOf('title')
    const matthewIdx = headers.indexOf('matthew')
    const markIdx = headers.indexOf('mark')
    const lukeIdx = headers.indexOf('luke')
    const johnIdx = headers.indexOf('john')

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i]
      const sectionTitle = values[titleIdx]?.trim() || ''
      if (!sectionTitle) continue

      const sectionId = `section-${i}`

      sections.push({
        id: sectionId,
        title: sectionTitle,
        passages: [
          { gospel: 'matthew', verses: normalizeVerses(values[matthewIdx]) },
          { gospel: 'mark', verses: normalizeVerses(values[markIdx]) },
          { gospel: 'luke', verses: normalizeVerses(values[lukeIdx]) },
          { gospel: 'john', verses: normalizeVerses(values[johnIdx]) },
        ],
      })
    }

    return {
      title: 'Custom Parallel Reading',
      sections,
    }
  }

  const processTextInput = async () => {
    if (!textContent.trim()) {
      setError('Please enter some content')
      return
    }

    setLoading(true)
    resetStatus()

    try {
      let data
      if (textInputMode === 'json') {
        const rawData = JSON.parse(textContent)
        const validation = validateStructure(rawData)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
        data = await transformImportData(rawData)
      } else {
        const csvData = parseCSV(textContent)
        const validation = validateStructure(csvData)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
        data = await transformImportData(csvData)
      }

      setSuccess(
        `Successfully loaded "${data.title}" with ${data.sections.length} section(s)`
      )
      onImport(data)
      closeTextInput()
    } catch (err) {
      setError(err.message || `Failed to parse ${textInputMode.toUpperCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const processFile = async (file) => {
    resetStatus()
    setLoading(true)

    const extension = file.name.split('.').pop().toLowerCase()
    if (!['json', 'csv'].includes(extension)) {
      setError('Please upload a .json or .csv file')
      setLoading(false)
      return
    }

    try {
      const content = await file.text()
      let data

      if (extension === 'json') {
        const rawData = JSON.parse(content)
        const validation = validateStructure(rawData)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
        data = await transformImportData(rawData)
      } else {
        const csvData = parseCSV(content)
        const validation = validateStructure(csvData)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
        data = await transformImportData(csvData)
      }

      setSuccess(
        `Successfully loaded "${data.title}" with ${data.sections.length} section(s)`
      )
      onImport(data)
    } catch (err) {
      setError(err.message || 'Failed to parse file')
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
        <h3 className="font-semibold">Import Parallel Verses</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Import your own parallel verses from a JSON or CSV file
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          transition-colors duration-200 flex flex-col items-center gap-3
          ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
          <FileJson size={32} />
          <span className="text-sm">or</span>
          <FileSpreadsheet size={32} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {loading ? 'Processing...' : 'Drop a file here, or click to browse'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Supports .json and .csv files
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />
      </div>

      {/* Text Input Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => openTextInput('json')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Edit3 size={16} />
          Paste JSON
        </button>
        <button
          onClick={() => openTextInput('csv')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Edit3 size={16} />
          Paste CSV
        </button>
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Paste {textInputMode?.toUpperCase()} Content
              </h4>
              <button
                onClick={closeTextInput}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={
                  textInputMode === 'json'
                    ? '{\n  "title": "My Custom Reading",\n  "sections": [...]\n}'
                    : 'Title,Matthew,Mark,Luke,John\nThe Birth,1:18-25,,2:1-20,'
                }
                className="w-full h-64 p-3 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                spellCheck={false}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={closeTextInput}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={processTextInput}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Import {textInputMode?.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Import failed</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
          <button onClick={resetStatus} className="shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
          <Check size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Import successful</p>
            <p className="text-xs mt-1 opacity-80">{success}</p>
          </div>
          <button onClick={resetStatus} className="shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* File Format Help */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          Expected File Formats:
        </p>
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-500">
          <details className="group">
            <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
              JSON Format
            </summary>
            <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto">
              {`{
  "title": "My Custom Reading",
  "sections": [{
    "id": "section-1",
    "title": "Section Name",
    "passages": [
      { "gospel": "matthew", "verses": "1:1-5" },
      { "gospel": "mark", "verses": "" },
      { "gospel": "luke", "verses": "" },
      { "gospel": "john", "verses": "" }
    ]
  }]
}`}
            </pre>
          </details>
          <details className="group">
            <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
              CSV Format
            </summary>
            <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto">
              {`Title,Matthew,Mark,Luke,John
The Preaching of John,"3:7-10
3:11-12",1:7-8,"3:7-9
3:15-18",
Temptations,4:1-11,,4:1-13,`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
