import axios from 'axios'
import socket from '../services/socket'

/**
 * Resolve the compute-statistics REST endpoint URL.
 */
function getApiUrl() {
  if (import.meta.env.VITE_BIBLE_API_INTERNAL_URL) {
    return `${import.meta.env.VITE_BIBLE_API_INTERNAL_URL}/api/compute-statistics`
  }
  const host = import.meta.env.VITE_BIBLE_API_URL || 'http://localhost'
  const port = import.meta.env.VITE_BIBLE_API_PORT || '3001'
  return `${host}:${port}/api/compute-statistics`
}

/**
 * ComputeStatisticsWorker — offloads heavy computation to the backend
 * via a BullMQ job, then lazily receives the result over WebSocket.
 *
 * The API schema returned on completion matches:
 * [{
 *   sectionId, sectionTitle,
 *   totalWords: { matthew, mark, luke, john },
 *   summary: { totalMatches, totalMatchingWords, uniqueSequences },
 *   pairs: { "matthew-mark": { count, totalWords, sequences, matchPercentage }, ... },
 *   mode
 * }]
 */
class ComputeStatisticsWorker {
  /**
   * Queue a compute-statistics job and wait for its result via WebSocket.
   *
   * @param {Object} params
   * @param {Array} params.sections  – sections array (mapped to `verses` on the API)
   * @param {number} [params.minLength=3]
   * @param {string} [params.mode='exact']
   * @param {number} [params.similarityThreshold=0.2]
   * @returns {Promise<Array>} per-section statistics
   */
  static perform({ sections, gospels, minLength = 3, mode = 'exact', similarityThreshold = 0.2 }) {
    // Normalise: the hook sends either `sections` or `gospels`
    const verses = sections || gospels || []

    return new Promise((resolve, reject) => {
      const TIMEOUT_MS = 120_000 // 2 min safety net

      axios
        .post(getApiUrl(), { verses, minLength, mode, similarityThreshold })
        .then(({ data }) => {
          const { jobId } = data

          let settled = false

          const timer = setTimeout(() => {
            if (!settled) {
              settled = true
              cleanup()
              reject(new Error(`Compute statistics timed out after ${TIMEOUT_MS / 1000}s (job ${jobId})`))
            }
          }, TIMEOUT_MS)

          function cleanup() {
            clearTimeout(timer)
            socket.off('compute-statistics-completed', onCompleted)
            socket.off('compute-statistics-failed', onFailed)
          }

          function onCompleted(payload) {
            if (payload.jobId !== jobId) return
            if (settled) return
            settled = true
            cleanup()
            resolve(payload.result)
          }

          function onFailed(payload) {
            if (payload.jobId !== jobId) return
            if (settled) return
            settled = true
            cleanup()
            reject(new Error(payload.error || 'Compute statistics job failed'))
          }

          socket.on('compute-statistics-completed', onCompleted)
          socket.on('compute-statistics-failed', onFailed)
        })
        .catch((err) => {
          reject(new Error(`Failed to queue compute-statistics: ${err.message}`))
        })
    })
  }
}

export default ComputeStatisticsWorker
