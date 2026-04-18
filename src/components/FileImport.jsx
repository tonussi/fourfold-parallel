import { useState, useRef } from 'react'
import { Upload, FileJson, FileSpreadsheet, AlertCircle, Check, X } from 'lucide-react'

export default function FileImport({ onImport }) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileInputRef = useRef(null)

  const resetStatus = () => {
    setError(null)
    setSuccess(null)
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
        return { valid: false, error: `Section "${section.title}" needs a "passages" array` }
      }
    }
    return { valid: true }
  }

  const parseCSV = (content) => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line)
    if (lines.length < 2) throw new Error('CSV needs at least a header row and one data row')

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const requiredCols = ['section_id', 'section_title', 'gospel']
    const missing = requiredCols.filter(col => !headers.includes(col))
    if (missing.length > 0) {
      throw new Error(`CSV missing required columns: ${missing.join(', ')}`)
    }

    // Build structure from CSV rows
    const sections = new Map()
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx] || ''
      })

      const sectionId = row.section_id
      const sectionTitle = row.section_title
      const gospel = row.gospel.toLowerCase()
      const reference = row.reference || ''
      
      // Parse verses - either from verses_json column or single verse_text column
      let verses = []
      if (row.verses_json) {
        try {
          verses = JSON.parse(row.verses_json)
        } catch {
          // If not valid JSON, treat as empty
        }
      } else if (row.verse_text && row.verse_num) {
        verses = [{ verse: parseInt(row.verse_num) || 1, text: row.verse_text }]
      }

      if (!sections.has(sectionId)) {
        sections.set(sectionId, {
          id: sectionId,
          title: sectionTitle,
          passages: []
        })
      }

      sections.get(sectionId).passages.push({
        gospel,
        reference,
        verses
      })
    }

    // Ensure all 4 gospels exist for each section
    const gospels = ['matthew', 'mark', 'luke', 'john']
    for (const section of sections.values()) {
      const existingGospels = new Set(section.passages.map(p => p.gospel))
      for (const g of gospels) {
        if (!existingGospels.has(g)) {
          section.passages.push({ gospel: g, reference: '', verses: [] })
        }
      }
      // Sort passages by gospel order
      section.passages.sort((a, b) => gospels.indexOf(a.gospel) - gospels.indexOf(b.gospel))
    }

    return {
      title: 'Custom Parallel Reading',
      sections: Array.from(sections.values())
    }
  }

  const processFile = async (file) => {
    resetStatus()
    
    const extension = file.name.split('.').pop().toLowerCase()
    if (!['json', 'csv'].includes(extension)) {
      setError('Please upload a .json or .csv file')
      return
    }

    try {
      const content = await file.text()
      let data

      if (extension === 'json') {
        data = JSON.parse(content)
      } else {
        data = parseCSV(content)
      }

      const validation = validateStructure(data)
      if (!validation.valid) {
        setError(validation.error)
        return
      }

      setSuccess(`Successfully loaded "${data.title}" with ${data.sections.length} section(s)`)
      onImport(data)
    } catch (err) {
      setError(err.message || 'Failed to parse file')
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
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          transition-colors duration-200 flex flex-col items-center gap-3
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }
        `}
      >
        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
          <FileJson size={32} />
          <span className="text-sm">or</span>
          <FileSpreadsheet size={32} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Drop a file here, or click to browse
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
        />
      </div>

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
    "passages": [{
      "gospel": "matthew",
      "reference": "Matt 1:1-5",
      "verses": [{"verse": 1, "text": "..."}]
    }]
  }]
}`}
            </pre>
          </details>
          <details className="group">
            <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
              CSV Format
            </summary>
            <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto">
{`section_id,section_title,gospel,reference,verses_json
section-1,The Birth,matthew,Matt 1:1,"[{\"verse\":1,\"text\":\"...\"}]"
section-1,The Birth,luke,Luke 2:1,"[{\"verse\":1,\"text\":\"...\"}]"`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
