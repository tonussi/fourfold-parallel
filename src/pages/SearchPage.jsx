import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, BookOpen, X } from 'lucide-react'
import { parseReference, LABELS, BOOKS, BibleVersionEnum } from '@verses/versesService'

// Import sample data for demo purposes
import parallelData from '../data/parallelVerses.json'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState('ACF')

  // Get all available versions
  const versions = Object.keys(BibleVersionEnum)

  // Search function using @verses library
  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use @verses library to parse the reference
      const parsed = parseReference(searchQuery)
      
      if (!parsed) {
        // If not a valid reference, try text search in sample data
        const textResults = searchInSampleData(searchQuery)
        setResults(textResults)
      } else {
        // Valid reference - format results
        const verseResults = formatParsedResults(parsed, searchQuery)
        setResults(verseResults)
      }
    } catch (err) {
      setError('Error searching: ' + err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Search within sample data verses
  const searchInSampleData = (query) => {
    const lowerQuery = query.toLowerCase()
    const matches = []
    
    parallelData.sections.forEach((section, sectionIdx) => {
      section.passages.forEach(passage => {
        passage.verses.forEach(verse => {
          if (verse.text.toLowerCase().includes(lowerQuery)) {
            matches.push({
              id: `${sectionIdx}-${passage.gospel}-${verse.number}`,
              reference: `${passage.reference}:${verse.number}`,
              text: verse.text,
              gospel: passage.gospel,
              section: section.title,
              type: 'text_match'
            })
          }
        })
      })
    })
    
    return matches.slice(0, 20) // Limit to 20 results
  }

  // Format parsed reference results
  const formatParsedResults = (parsed, originalQuery) => {
    // Create a formatted result based on the parsed reference
    return [{
      id: `ref-${Date.now()}`,
      reference: `${BOOKS[parsed.book] || 'Unknown'} ${parsed.chapter}:${parsed.startVerse}${parsed.endVerse !== parsed.startVerse ? `-${parsed.endVerse}` : ''}`,
      bookName: parsed.bookName,
      chapter: parsed.chapter,
      startVerse: parsed.startVerse,
      endVerse: parsed.endVerse,
      version: selectedVersion,
      parsed: parsed,
      type: 'reference',
      text: `Parsed reference: Book #${parsed.book}, Chapter ${parsed.chapter}, Verses ${parsed.startVerse}-${parsed.endVerse}`,
      originalQuery
    }]
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        handleSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, selectedVersion])

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Back to Reader"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              Bible Search
            </h1>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Version Selector */}
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none sm:w-28"
            >
              {versions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verses (e.g., 'Matthew 1:1' or 'love')..."
                className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                autoFocus
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Search Help */}
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Tip: Enter a reference like "Matthew 1:18-25" or search by keyword.
            Using @verses library for reference parsing.
          </p>
        </div>

        {/* Results Section */}
        <div className="mt-6 space-y-4">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                No results found for "{query}"
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 px-1">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {result.reference}
                        </span>
                        {result.type === 'reference' && (
                          <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                            {result.version}
                          </span>
                        )}
                        {result.gospel && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full capitalize">
                            {result.gospel}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {result.text}
                      </p>
                      
                      {result.section && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                          From: {result.section}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !query && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Start Searching
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Enter a Bible reference like "Matthew 1:18-25" or search for keywords across the four Gospels.
              </p>
              
              {/* Quick Examples */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['Matthew 1:18', 'Mark 2:1-12', 'Luke 1:26-38', 'John 3:16'].map(example => (
                  <button
                    key={example}
                    onClick={() => setQuery(example)}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}