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
      let expectedJobId = null
      let settled = false
      let timer = null
      let bufferedPayload = null

      function cleanup() {
        if (timer) clearTimeout(timer)
        socket.off('compute-statistics-completed', onCompleted)
        socket.off('compute-statistics-failed', onFailed)
      }

      function onCompleted(payload) {
        // If we don't know the jobId yet, buffer it (might be our fast job)
        if (expectedJobId === null) {
          bufferedPayload = payload
          return
        }
        if (String(payload.jobId) !== String(expectedJobId)) return
        if (settled) return
        settled = true
        cleanup()
        resolve(payload.result)
      }

      function onFailed(payload) {
        if (expectedJobId === null) return // Ignore early fails without ID, though we could buffer them too
        if (String(payload.jobId) !== String(expectedJobId)) return
        if (settled) return
        settled = true
        cleanup()
        reject(new Error(payload.error || 'Compute statistics job failed'))
      }

      const executeJob = () => {
        // Attach listeners BEFORE triggering the job to avoid race conditions
        socket.on('compute-statistics-completed', onCompleted)
        socket.on('compute-statistics-failed', onFailed)

        api
          .post('/api/compute-statistics', { verses, minLength, mode, similarityThreshold, translationVersion })
          .then(({ data }) => {
            expectedJobId = data.jobId

            // Check if we already received the completion event while waiting for the HTTP response
            if (bufferedPayload && String(bufferedPayload.jobId) === String(expectedJobId)) {
              if (!settled) {
                settled = true
                cleanup()
                resolve(bufferedPayload.result)
              }
            }

            timer = setTimeout(() => {
              if (!settled) {
                settled = true
                cleanup()
                reject(new Error(`Compute statistics timed out after ${TIMEOUT_MS / 1000}s (job ${expectedJobId})`))
              }
            }, TIMEOUT_MS)
          })
          .catch((err) => {
            if (!settled) {
              settled = true
              cleanup()
              reject(new Error(`Failed to queue compute-statistics: ${err.message}`))
            }
          })
      }

      if (socket.connected) {
        executeJob()
      } else {
        const onConnect = () => {
          socket.off('connect', onConnect)
          executeJob()
        }
        socket.on('connect', onConnect)
        
        // Safety timeout in case socket never connects
        setTimeout(() => {
          if (!socket.connected && !settled) {
            socket.off('connect', onConnect)
            settled = true
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000)
      }
    })
  }
}

export default ComputeStatisticsWorker
