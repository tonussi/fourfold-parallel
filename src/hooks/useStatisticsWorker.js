// useStatisticsWorker - Hook for async statistics computation with Web Worker
import { useEffect, useRef, useCallback, useState } from 'react'
import ComputeStatisticsWorker from './computeStatistics'

/**
 * Hook for computing word sequence statistics
 * @param {Object} options
 * @param {number} options.minLength - minimum matching word sequence length
 * @param {string} options.mode - 'exact' or 'relaxed' (fuzzy matching)
 * @param {number} options.similarityThreshold - max edit distance ratio for relaxed mode
 */
export function useStatisticsWorker({
  minLength = 3,
  mode = 'exact',
  similarityThreshold = 0.2,
  translationVersion = null,
} = {}) {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [transVersion, setTransVersion] = useState(translationVersion)
  const minLengthRef = useRef(minLength)
  const modeRef = useRef(mode)
  const thresholdRef = useRef(similarityThreshold)

  useEffect(() => {
    minLengthRef.current = minLength
  }, [minLength])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    thresholdRef.current = similarityThreshold
  }, [similarityThreshold])

  const computeSectionStats = useCallback(async (section) => {
    if (!section) return null
    setIsLoading(true)
    setError(null)
    try {
      const result = await ComputeStatisticsWorker.perform({
        sections: [section],
        minLength: minLengthRef.current,
        mode: modeRef.current,
        similarityThreshold: thresholdRef.current,
        translationVersion: transVersion,
      })
      setResults(result[0])
      return result[0]
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const computeAllSectionStats = useCallback(async (sections) => {
    if (!sections || sections.length === 0) return null
    setIsLoading(true)
    setError(null)
    try {
      const result = await ComputeStatisticsWorker.perform({
        sections,
        minLength: minLengthRef.current,
        mode: modeRef.current,
        similarityThreshold: thresholdRef.current,
      })
      setResults(result)
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const computeStats = useCallback(async (gospels) => {
    if (!gospels) return null
    setIsLoading(true)
    setError(null)
    try {
      const result = await ComputeStatisticsWorker.perform({
        gospels,
        minLength: minLengthRef.current,
        mode: modeRef.current,
        similarityThreshold: thresholdRef.current,
      })
      setResults(result)
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    computeSectionStats,
    computeAllSectionStats,
    computeStats,
    results,
    isLoading,
    error,
    setTranslationVersion: setTransVersion,
    translationVersion: transVersion,
  }
}

/**
 * Format a sequence for display with its references
 */
export function formatSequenceWithReference(seq, g1, g2) {
  if (!seq) return { words: '', references: {} }

  const words = Array.isArray(seq.words) ? seq.words.join(' ') : seq.words || ''
  const words2 = Array.isArray(seq.words2) ? seq.words2.join(' ') : null

  const references = {}
  if (g1) references[g1] = seq.verse1 || seq[`verse_${g1}`]
  if (g2)
    references[g2] = seq.verse2 || seq[`verse_${g2}`]

    // Add all gospel references if they exist
  ;['matthew', 'mark', 'luke', 'john'].forEach((g) => {
    const ref =
      seq[`verse_${g}`] || seq[`verse${g.charAt(0).toUpperCase() + g.slice(1)}`]
    if (ref) references[g] = ref
  })

  const fullTexts = {}
  const translations = {}
  ;['matthew', 'mark', 'luke', 'john'].forEach((g) => {
    if (seq[`text_${g}`]) fullTexts[g] = seq[`text_${g}`]
    if (seq[`translation_${g}`]) translations[g] = seq[`translation_${g}`]
  })

  return {
    words: words2 && words !== words2 ? `${words} ≈ ${words2}` : words,
    references,
    fullTexts,
    translations,
    similarity: seq.similarity,
  }
}

export default useStatisticsWorker
