import api from '../services/api'
import socket from '../services/socket'

/**
 * ComputeStatisticsWorker — offloads heavy computation to the backend
 * via a BullMQ job, then lazily receives the result over WebSocket.
 */
class ComputeStatisticsWorker {
  /**
   * Queue a compute-statistics job and wait for its result via WebSocket.
   */
  static perform({ sections, gospels, minLength = 3, mode = 'exact', similarityThreshold = 0.2, translationVersion = null }) {
    // Normalise: the hook sends either `sections` or `gospels`
    const verses = sections || gospels || []

    return new Promise((resolve, reject) => {
      const TIMEOUT_MS = 120_000 // 2 min safety net

      api
        .post('/api/compute-statistics', { verses, minLength, mode, similarityThreshold, translationVersion })
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
