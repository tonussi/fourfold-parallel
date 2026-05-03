// useStatisticsWorker - Hook for async statistics computation with Web Worker
import { useEffect, useRef, useCallback, useState } from 'react'

let workerInstance = null
let currentToken = 0
const pendingRequests = new Map()

/**
 * Initialize the worker (singleton pattern)
 */
function getWorker() {
  if (!workerInstance) {
    const workerCode = `
      // Include Greek (α-ωΑ-Ω) + Latin (a-zA-Z) + numbers
      const tokenize = (text) => {
        if (!text) return [];
        return text.toLowerCase().replace(/[^α-ωΑ-Ωa-zA-Z0-9\\s]/g, ' ').split(/\\s+/).filter(w => w.length > 0);
      };
      const buildVerseWordMap = (verses) => {
        const result = [], words = [];
        let wordIdx = 0;
        (verses || []).forEach(v => {
          const w = tokenize(v.text);
          w.forEach(x => { words.push({ word: x, verse: v.verse, wordIdx: wordIdx++ }); });
        });
        return words;
      };
      const getVerseAtWordIdx = (map, idx) => {
        for (let i = map.length - 1; i >= 0; i--) { if (map[i].wordIdx <= idx) return map[i].verse; }
        return map[0]?.verse || 1;
      };
      // Levenshtein distance
      const levDist = (a, b) => {
        const m = [];
        for (let i = 0; i <= b.length; i++) m[i] = [i];
        for (let j = 0; j <= a.length; j++) m[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : 1 + Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1]);
          }
        }
        return m[b.length][a.length];
      };
      // Check if two words are similar
      const areSimilar = (w1, w2, thresh = 0.2) => {
        if (w1 === w2) return true;
        const maxLen = Math.max(w1.length, w2.length);
        if (maxLen === 0) return true;
        if (maxLen <= 3) return levDist(w1, w2) <= 1;
        return (levDist(w1, w2) / maxLen) <= thresh;
      };
      // Exact matching
      const findMatchingSequences = (w1, w2, minLen, vwm1, vwm2) => {
        const matches = [];
        if (w1.length < minLen || w2.length < minLen) return matches;
        for (let i = 0; i <= w1.length - minLen; i++) {
          for (let j = 0; j <= w2.length - minLen; j++) {
            let len = 0;
            while (i + len < w1.length && j + len < w2.length && w1[i + len] === w2[j + len]) len++;
            if (len >= minLen && !matches.some(m => m.start1 === i && m.start2 === j)) {
              matches.push({ words: w1.slice(i, i + len), length: len, start1: i, start2: j, verse1: getVerseAtWordIdx(vwm1, i), verse2: getVerseAtWordIdx(vwm2, j) });
            }
          }
        }
        return matches;
      };
      // Relaxed (similar) matching
      const findRelaxedMatchingSequences = (w1, w2, minLen, vwm1, vwm2, thresh = 0.2) => {
        const matches = [];
        if (w1.length < minLen || w2.length < minLen) return matches;
        for (let i = 0; i <= w1.length - minLen; i++) {
          for (let j = 0; j <= w2.length - minLen; j++) {
            let len = 0, totalSim = 0;
            while (i + len < w1.length && j + len < w2.length) {
              const wx = w1[i + len], wy = w2[j + len];
              if (areSimilar(wx, wy, thresh)) { 
                const d = wx === wy ? 0 : levDist(wx, wy);
                const ml = Math.max(wx.length, wy.length);
                totalSim += ml === 0 ? 1 : 1 - (d / ml);
                len++; 
              } else break;
            }
            if (len >= minLen) {
              const avgSim = Math.round((totalSim / len) * 100);
              if (!matches.some(m => m.start1 === i && m.start2 === j)) {
                matches.push({ words: w1.slice(i, i + len), words2: w2.slice(j, j + len), length: len, start1: i, start2: j, verse1: getVerseAtWordIdx(vwm1, i), verse2: getVerseAtWordIdx(vwm2, j), similarity: avgSim });
              }
            }
          }
        }
        return matches;
      };
      const computeStatistics = (gvw, minLen, mode = 'exact', thresh = 0.2) => {
        const gList = ['matthew','mark','luke','john'].filter(g => gvw[g]);
        const tok = {}, vwm = {};
        gList.forEach(g => {
          const d = gvw[g];
          const t = typeof d === 'string' ? d : (d?.text || '');
          const v = typeof d === 'object' && Array.isArray(d?.verses) ? d.verses : [];
          tok[g] = tokenize(t);
          vwm[g] = buildVerseWordMap(v);
        });
        const stats = { totalWords: {}, summary: { totalMatches: 0, totalMatchingWords: 0, uniqueSequences: [] }, pairs: {}, mode: mode };
        gList.forEach(g => { stats.totalWords[g] = tok[g].length; });
        for (let i = 0; i < gList.length; i++) {
          for (let j = i + 1; j < gList.length; j++) {
            const g1 = gList[i], g2 = gList[j], key = g1 + '-' + g2;
            const m = mode === 'relaxed' 
              ? findRelaxedMatchingSequences(tok[g1], tok[g2], minLen, vwm[g1], vwm[g2], thresh)
              : findMatchingSequences(tok[g1], tok[g2], minLen, vwm[g1], vwm[g2]);
            const total = m.reduce((s, x) => s + x.length, 0);
            stats.pairs[key] = { count: m.length, totalWords: total, sequences: m, matchPercentage: { [g1]: tok[g1].length > 0 ? ((total / tok[g1].length) * 100).toFixed(1) : 0, [g2]: tok[g2].length > 0 ? ((total / tok[g2].length) * 100).toFixed(1) : 0 } };
          }
        }
        if (gList.length >= 2) {
          let common = stats.pairs[gList[0] + '-' + gList[1]]?.sequences || [];
          for (let i = 2; i < gList.length; i++) {
            const nextSeqs = stats.pairs[gList[0] + '-' + gList[i]]?.sequences || [];
            common = common.filter(s1 => nextSeqs.some(s2 => s1.words.join(' ') === s2.words.join(' ')));
          }
          if (common.length > 0) {
            const enhancedCommon = common.map(seq => {
              const result = {...seq};
              gList.forEach((g, idx) => { result['verse_' + g] = seq['verse' + (idx + 1)] || null; });
              return result;
            });
            stats.summary.uniqueSequences = enhancedCommon;
            stats.summary.totalMatches = enhancedCommon.length;
            stats.summary.totalMatchingWords = enhancedCommon.reduce((s, m) => s + m.length, 0);
          }
        }
        return stats;
      };
      self.onmessage = function(e) {
        const { type, payload, id } = e.data;
        try {
          if (type === 'COMPUTE_STATISTICS') {
            self.postMessage({ type: 'STATISTICS_RESULT', id, payload: computeStatistics(payload.gospels, payload.minLength || 3, payload.mode || 'exact', payload.similarityThreshold || 0.2) });
          } else if (type === 'COMPUTE_SECTION_STATISTICS') {
            const results = payload.sections.map((section) => {
              const gvw = {};
              section.passages?.forEach(p => {
                if (p.verses && Array.isArray(p.verses)) gvw[p.gospel] = { text: p.verses.map(v => v.text).join(' '), verses: p.verses };
              });
              return { sectionId: section.id, sectionTitle: section.title, ...computeStatistics(gvw, payload.minLength || 3, payload.mode || 'exact', payload.similarityThreshold || 0.2) };
            });
            self.postMessage({ type: 'SECTION_STATS_RESULT', id, payload: results });
          } else {
            self.postMessage({ type: 'ERROR', id, payload: { error: 'Unknown type' } });
          }
        } catch (err) { self.postMessage({ type: 'STATISTICS_ERROR', id, payload: { error: err.message } }); }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerInstance = new Worker(URL.createObjectURL(blob));
    
    workerInstance.onmessage = (e) => {
      const { type, id, payload } = e.data
      const pending = pendingRequests.get(id)
      
      if (pending) {
        const { resolve, reject } = pending
        if (type === 'STATISTICS_RESULT' || type === 'SECTION_STATS_RESULT') {
          resolve(payload)
        } else if (type === 'STATISTICS_ERROR' || type === 'ERROR') {
          reject(new Error(payload.error || 'Unknown error'))
        }
        pendingRequests.delete(id)
      }
    }
    
    workerInstance.onerror = (error) => {
      console.error('Statistics Worker Error:', error)
      pendingRequests.forEach((pending) => pending.reject(new Error('Worker crashed')))
      pendingRequests.clear()
    }
  }
  
  return workerInstance
}

/**
 * Send a message to the worker and return a promise
 */
function sendToWorker(type, payload) {
  return new Promise((resolve, reject) => {
    const worker = getWorker()
    const id = ++currentToken
    pendingRequests.set(id, { resolve, reject })
    worker.postMessage({ type, payload, id })
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id)
        reject(new Error('Statistics computation timed out'))
      }
    }, 60000)
  })
}

/**
 * Hook for computing word sequence statistics
 * @param {Object} options
 * @param {number} options.minLength - minimum matching word sequence length
 * @param {string} options.mode - 'exact' or 'relaxed' (fuzzy matching)
 * @param {number} options.similarityThreshold - max edit distance ratio for relaxed mode
 */
export function useStatisticsWorker({ minLength = 3, mode = 'exact', similarityThreshold = 0.2 } = {}) {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
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
      const result = await sendToWorker('COMPUTE_SECTION_STATISTICS', {
        sections: [section],
        minLength: minLengthRef.current,
        mode: modeRef.current,
        similarityThreshold: thresholdRef.current,
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
      const result = await sendToWorker('COMPUTE_SECTION_STATISTICS', {
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
      const result = await sendToWorker('COMPUTE_STATISTICS', {
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
  }
}

/**
 * Format a sequence for display with its references
 */
export function formatSequenceWithReference(seq, g1, g2) {
  if (!seq) return { words: '', references: {} }
  
  const words = Array.isArray(seq.words) ? seq.words.join(' ') : (seq.words || '')
  const words2 = Array.isArray(seq.words2) ? seq.words2.join(' ') : null
  
  const references = {}
  if (g1) references[g1] = seq.verse1 || seq[`verse_${g1}`]
  if (g2) references[g2] = seq.verse2 || seq[`verse_${g2}`]
  
  // Add all gospel references if they exist
  ;['matthew', 'mark', 'luke', 'john'].forEach(g => {
    const ref = seq[`verse_${g}`] || seq[`verse${g.charAt(0).toUpperCase() + g.slice(1)}`]
    if (ref) references[g] = ref
  })
  
  return { 
    words: words2 && words !== words2 ? `${words} ≈ ${words2}` : words, 
    references,
    similarity: seq.similarity 
  }
}

export default useStatisticsWorker