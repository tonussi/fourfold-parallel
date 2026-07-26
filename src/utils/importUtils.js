import { fetchVerses } from '@src/verses'

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

export const normalizeVerses = (versesStr) => {
  if (!versesStr || typeof versesStr !== 'string') return ''
  return versesStr
    .split(/[;\r?\n]+/)
    .map((v) => v.trim())
    .filter((v) => v)
    .join(';')
}

// Parse a single verse range like "1:5" or "1:5-10"
export const parseSingleVerseRange = (rangeStr) => {
  const match = rangeStr.trim().match(/^(\d+):(\d+)(?:-(\d+))?$/)
  if (!match) return null

  return {
    chapter: parseInt(match[1], 10),
    startVerse: parseInt(match[2], 10),
    endVerse: match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10),
  }
}

// Parse verses format supporting multiple ranges separated by semicolons or newlines
export const parseVersesFormat = (gospel, versesStr) => {
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
export const fetchVerseContent = async (gospel, versesStr, version = 'OGNT') => {
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

export const parseCSV = (content) => {
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
      loaded: false,
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

export const validateStructure = (data) => {
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
