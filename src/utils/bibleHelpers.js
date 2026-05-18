import { parseReference, LABELS, BOOKS_PROTESTANT } from '@src/verses'

export const GOSPELS = ['matthew', 'mark', 'luke', 'john']

export const EXAMPLES = [
  {
    name: 'The Complete Gospels (Q)',
    file: 'TheCompleteGospels-Q.csv',
    type: 'CSV',
  },
  { name: 'Bart Ehrman - Q', file: 'BartEhrman-Q.csv', type: 'CSV' },
  { name: 'A Theology of Q', file: 'ATheologyOfQ-Q.csv', type: 'CSV' },
  { name: 'Research Notes', file: 'Q-Researchers.md', type: 'MD' },
  { name: 'CJ Cornthwaite', file: 'CJCornthwaite.csv', type: 'CSV' },
  {
    name: 'Parallel Reading (Full - Beta Version)',
    file: 'ParallelReading-Full-BetaVersion.csv',
    type: 'CSV',
  },
]

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

// Transform simplified verse format to full format with reference
export const transformData = (data) => {
  if (!data?.sections) return data

  return {
    ...data,
    sections: data.sections.map((section) => ({
      ...section,
      passages: section.passages.map((passage) => {
        // If already has reference and verses array, return as-is
        if (
          passage.reference &&
          Array.isArray(passage.verses) &&
          passage.verses.length > 0
        ) {
          return passage
        }
        // Transform simplified format
        const versesStr = passage.verses || ''
        if (!versesStr) {
          return { ...passage, reference: '', verses: [] }
        }

        // Parse "chapter:verseFrom-verseTo" or "chapter:verse" format
        const match = versesStr.match(/^(\d+):(\d+)(?:-(\d+))?$/)
        if (!match) {
          return { ...passage, reference: '', verses: [] }
        }

        const chapter = match[1]
        const startVerse = parseInt(match[2], 10)
        const endVerse = match[3] ? parseInt(match[3], 10) : startVerse

        const bookName = capitalize(passage.gospel)
        const verseRef =
          startVerse === endVerse
            ? `${chapter}:${startVerse}`
            : `${chapter}:${startVerse}-${endVerse}`
        const reference = `${bookName} ${verseRef}`

        // Create empty verse array (text would be fetched from API)
        const verses = []
        for (let v = startVerse; v <= endVerse; v++) {
          verses.push({ verse: v, text: '' })
        }

        return { ...passage, reference, verses }
      }),
    })),
  }
}

// Helper function using @verses library to process verse references
export function processVerseReference(reference) {
  if (!reference) return null
  // Use the verses library to parse the reference
  const parsed = parseReference(reference)
  return parsed
}

// Get display title from verses library
export function getBookDisplayTitle(gospel) {
  const bookNum =
    LABELS[gospel] || LABELS[gospel.charAt(0).toUpperCase() + gospel.slice(1)]
  return bookNum ? BOOKS_PROTESTANT[bookNum] : gospel
}
