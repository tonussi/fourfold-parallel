// Word Sequence Statistics Worker
// Computes statistics for identical word sequences across parallel gospel sections
// Tracks verse positions for each sequence

let token = 0

/**
 * Tokenize text into words, removing punctuation
 * @param {string} text 
 * @returns {string[]}
 */
function tokenize(text) {
  if (!text) return []
  // Include Greek (α-ωΑ-Ω) + Latin (a-zA-Z) + numbers in word chars
  return text
    .toLowerCase()
    .replace(/[^α-ωΑ-Ωa-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
}

/**
 * Build a word-to-verse mapping for tracking verse references
 * @param {Array<{verse: number, text: string}>} verses 
 * @returns {{words: string[], verse: number, startWordIdx: number}[]}
 */
function buildVerseWordMap(verses) {
  const result = []
  let wordIdx = 0
  verses.forEach(v => {
    const words = tokenize(v.text)
    words.forEach(w => {
      result.push({ word: w, verse: v.verse, wordIdx: wordIdx++ })
    })
  })
  return result
}

/**
 * Find verse reference for a word position
 * @param {Array} verseWordMap 
 * @param {number} wordIdx 
 * @returns {number}
 */
function getVerseAtWordIdx(verseWordMap, wordIdx) {
  for (let i = verseWordMap.length - 1; i >= 0; i--) {
    if (verseWordMap[i].wordIdx <= wordIdx) {
      return verseWordMap[i].verse
    }
  }
  return verseWordMap[0]?.verse || 1
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
function levenshteinDistance(a, b) {
  const matrix = []
  
  // Initialize
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  
  // Fill in the rest
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = 1 + Math.min(
          matrix[i - 1][j],     // deletion
          matrix[i][j - 1],     // insertion
          matrix[i - 1][j - 1]  // substitution
        )
      }
    }
  }
  
  return matrix[b.length][a.length]
}

/**
 * Check if two words are similar based on edit distance threshold
 * @param {string} word1 
 * @param {string} word2 
 * @param {number} threshold - max allowed edit distance
 * @returns {boolean}
 */
function areSimilar(word1, word2, threshold = 0.2) {
  if (word1 === word2) return true
  
  const maxLen = Math.max(word1.length, word2.length)
  if (maxLen === 0) return true
  
  // For very short words, be stricter
  if (maxLen <= 3) {
    return levenshteinDistance(word1, word2) <= 1
  }
  
  const distance = levenshteinDistance(word1, word2)
  return (distance / maxLen) <= threshold
}

/**
 * Find all sequences of N consecutive identical words between two texts
 * @param {string[]} words1 
 * @param {string[]} words2 
 * @param {number} minLength - minimum sequence length (default 3)
 * @param {Array} verseWordMap1 - for verse reference tracking
 * @param {Array} verseWordMap2 - for verse reference tracking
 * @returns {Array<{words: string[], length: number, start1: number, start2: number, verse1: number, verse2: number, similarity?: number}>}
 */
function findMatchingSequences(words1, words2, minLength = 3, verseWordMap1 = [], verseWordMap2 = []) {
  const matches = []
  
  if (words1.length < minLength || words2.length < minLength) {
    return matches
  }

  for (let i = 0; i <= words1.length - minLength; i++) {
    for (let j = 0; j <= words2.length - minLength; j++) {
      let matchLen = 0
      while (
        i + matchLen < words1.length &&
        j + matchLen < words2.length &&
        words1[i + matchLen] === words2[j + matchLen]
      ) {
        matchLen++
      }
      
      if (matchLen >= minLength) {
        const isDuplicate = matches.some(m => m.start1 === i && m.start2 === j)
        if (!isDuplicate) {
          matches.push({
            words: words1.slice(i, i + matchLen),
            length: matchLen,
            start1: i,
            start2: j,
            verse1: getVerseAtWordIdx(verseWordMap1, i),
            verse2: getVerseAtWordIdx(verseWordMap2, j),
          })
        }
      }
    }
  }
  
  return matches
}

/**
 * Find all sequences of N consecutive similar words between two texts (relaxed mode)
 * @param {string[]} words1 
 * @param {string[]} words2 
 * @param {number} minLength - minimum sequence length (default 3)
 * @param {Array} verseWordMap1 - for verse reference tracking
 * @param {Array} verseWordMap2 - for verse reference tracking
 * @param {number} similarityThreshold - max edit distance ratio (default 0.2)
 * @returns {Array<{words: string[], length: number, start1: number, start2: number, verse1: number, verse2: number, similarity: number}>}
 */
function findRelaxedMatchingSequences(words1, words2, minLength = 3, verseWordMap1 = [], verseWordMap2 = [], similarityThreshold = 0.2) {
  const matches = []
  
  if (words1.length < minLength || words2.length < minLength) {
    return matches
  }

  for (let i = 0; i <= words1.length - minLength; i++) {
    for (let j = 0; j <= words2.length - minLength; j++) {
      let matchLen = 0
      let totalSimilarity = 0
      
      // Try to match as many consecutive similar words as possible
      while (
        i + matchLen < words1.length &&
        j + matchLen < words2.length
      ) {
        const w1 = words1[i + matchLen]
        const w2 = words2[j + matchLen]
        
        if (areSimilar(w1, w2, similarityThreshold)) {
          // Calculate actual similarity score for this word pair
          const dist = w1 === w2 ? 0 : levenshteinDistance(w1, w2)
          const maxLen = Math.max(w1.length, w2.length)
          const sim = maxLen === 0 ? 1 : 1 - (dist / maxLen)
          
          totalSimilarity += sim
          matchLen++
        } else {
          break
        }
      }
      
      if (matchLen >= minLength) {
        const avgSimilarity = totalSimilarity / matchLen
        const isDuplicate = matches.some(m => m.start1 === i && m.start2 === j)
        if (!isDuplicate) {
          matches.push({
            words: words1.slice(i, i + matchLen),
            words2: words2.slice(j, j + matchLen),
            length: matchLen,
            start1: i,
            start2: j,
            verse1: getVerseAtWordIdx(verseWordMap1, i),
            verse2: getVerseAtWordIdx(verseWordMap2, j),
            similarity: Math.round(avgSimilarity * 100),
          })
        }
      }
    }
  }
  
  return matches
}

/**
 * Find all unique identical word sequences across multiple gospels
 * @param {Object} gospelsWithVerses - { matthew: {text, verses}, mark: {text, verses}, ... }
 * @param {number} minLength - minimum sequence length (default 3)
 * @param {string} mode - 'exact' or 'relaxed' (default 'exact')
 * @param {number} similarityThreshold - for relaxed mode, max edit distance ratio
 * @returns {Object} statistics for each pair and all gospels combined
 */
function computeStatistics(gospelsWithVerses, minLength = 3, mode = 'exact', similarityThreshold = 0.2) {
  const gospelList = ['matthew', 'mark', 'luke', 'john'].filter(g => gospelsWithVerses[g])
  const tokenized = {}
  const verseWordMaps = {}
  
  gospelList.forEach(g => {
    const gData = gospelsWithVerses[g]
    const text = typeof gData === 'string' ? gData : (gData?.text || '')
    const verses = typeof gData === 'object' && Array.isArray(gData?.verses) ? gData.verses : []
    tokenized[g] = tokenize(text)
    verseWordMaps[g] = buildVerseWordMap(verses)
  })

  const statistics = {
    totalWords: {},
    summary: {
      totalMatches: 0,
      totalMatchingWords: 0,
      uniqueSequences: [],
    },
    pairs: {},
    mode: mode,
  }

  gospelList.forEach(g => {
    statistics.totalWords[g] = tokenized[g].length
  })

  for (let i = 0; i < gospelList.length; i++) {
    for (let j = i + 1; j < gospelList.length; j++) {
      const g1 = gospelList[i]
      const g2 = gospelList[j]
      const pairKey = `${g1}-${g2}`
      
      const matches = mode === 'relaxed'
        ? findRelaxedMatchingSequences(
            tokenized[g1], 
            tokenized[g2], 
            minLength,
            verseWordMaps[g1],
            verseWordMaps[g2],
            similarityThreshold
          )
        : findMatchingSequences(
            tokenized[g1], 
            tokenized[g2], 
            minLength,
            verseWordMaps[g1],
            verseWordMaps[g2]
          )
      
      const totalMatchingWords = matches.reduce((sum, m) => sum + m.length, 0)
      
      statistics.pairs[pairKey] = {
        count: matches.length,
        totalWords: totalMatchingWords,
        sequences: matches,
        matchPercentage: {
          [g1]: tokenized[g1].length > 0 
            ? ((totalMatchingWords / tokenized[g1].length) * 100).toFixed(1)
            : 0,
          [g2]: tokenized[g2].length > 0 
            ? ((totalMatchingWords / tokenized[g2].length) * 100).toFixed(1)
            : 0,
        },
      }
    }
  }

  if (gospelList.length >= 2) {
    let commonSequences = statistics.pairs[`${gospelList[0]}-${gospelList[1]}`]?.sequences || []
    
    for (let i = 2; i < gospelList.length; i++) {
      const g = gospelList[i]
      const pairKey = `${gospelList[0]}-${g}`
      const nextSequences = statistics.pairs[pairKey]?.sequences || []
      
      const wordsJoin = mode === 'relaxed' 
        ? (seq) => seq.words.join(' ') 
        : (seq) => seq.words.join(' ')
      
      commonSequences = commonSequences.filter(seq1 => 
        nextSequences.some(seq2 => 
          wordsJoin(seq1) === wordsJoin(seq2)
        )
      ).map(seq1 => {
        const matchingSeq = nextSequences.find(seq2 => wordsJoin(seq1) === wordsJoin(seq2))
        return {
          ...seq1,
          [`verse_${g}`]: matchingSeq ? matchingSeq[`verse${i + 1}`] : null,
        }
      })
    }

    // Enhance common sequences with all verse references
    const enhancedCommon = commonSequences.map(seq => {
      const result = { ...seq }
      gospelList.forEach((g, idx) => {
        const verseProp = idx === 0 ? 'verse1' : idx === 1 ? 'verse2' : idx === 2 ? 'verse3' : 'verse4'
        result[`verse_${g}`] = seq[verseProp] || null
      })
      return result
    })

    if (enhancedCommon.length > 0) {
      statistics.summary.uniqueSequences = enhancedCommon
      statistics.summary.totalMatches = enhancedCommon.length
      statistics.summary.totalMatchingWords = enhancedCommon.reduce((sum, m) => sum + m.length, 0)
    }
  }

  return statistics
}

// Worker message handler
self.onmessage = function(e) {
  const { type, payload, id } = e.data
  
  try {
    switch (type) {
      case 'COMPUTE_STATISTICS': {
        const { gospels, minLength = 3, mode = 'exact', similarityThreshold = 0.2 } = payload
        const stats = computeStatistics(gospels, minLength, mode, similarityThreshold)
        self.postMessage({ type: 'STATISTICS_RESULT', id, payload: stats })
        break
      }
      
      case 'COMPUTE_SECTION_STATISTICS': {
        const { sections, minLength = 3, mode = 'exact', similarityThreshold = 0.2 } = payload
        
        const results = sections.map((section) => {
          const gospelsWithVerses = {}
          section.passages?.forEach(passage => {
            if (passage.verses && Array.isArray(passage.verses)) {
              gospelsWithVerses[passage.gospel] = {
                text: passage.verses.map(v => v.text).join(' '),
                verses: passage.verses,
              }
            }
          })
          
          const stats = computeStatistics(gospelsWithVerses, minLength, mode, similarityThreshold)
          return {
            sectionId: section.id,
            sectionTitle: section.title,
            ...stats,
          }
        })
        
        self.postMessage({ type: 'SECTION_STATS_RESULT', id, payload: results })
        break
      }
      
      default:
        self.postMessage({ type: 'ERROR', id, payload: { error: `Unknown message type: ${type}` } })
    }
  } catch (error) {
    self.postMessage({ type: 'STATISTICS_ERROR', id, payload: { error: error.message } })
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeStatistics, findMatchingSequences, tokenize, levenshteinDistance, areSimilar }
}