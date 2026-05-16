import { io } from 'socket.io-client'

/**
 * Resolve the bible-api WebSocket URL from environment variables.
 * Uses the same env vars the REST layer already relies on.
 */
function getSocketUrl() {
  const host = import.meta.env.VITE_BIBLE_API_URL || 'http://localhost'
  const port = import.meta.env.VITE_BIBLE_API_PORT || '3001'
  return `${host}:${port}`
}

/** Singleton socket instance — auto-connects on import. */
const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
  transports: ['websocket'], // Force WebSocket to avoid polling noise
})

socket.on('connect', () => {
  console.log('[ws] connected', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('[ws] disconnected', reason)
})

socket.on('connect_error', (err) => {
  console.warn('[ws] connection error', err.message)
})

/**
 * Inactivity Tracker: Disconnects the socket after 3 hours of inactivity.
 * Reconnects automatically if the user becomes active again.
 */
let activityTimer = null
const INACTIVITY_LIMIT = 3 * 60 * 60 * 1000 // 3 hours

function resetActivityTimer() {
  if (activityTimer) clearTimeout(activityTimer)

  // If the socket was disconnected due to inactivity, reconnect it
  if (!socket.connected) {
    console.log('[ws] User active again, reconnecting...')
    socket.connect()
  }

  activityTimer = setTimeout(() => {
    console.log('[ws] Disconnecting due to inactivity (3 hours)')
    socket.disconnect()
  }, INACTIVITY_LIMIT)
}

// Track common user interactions
if (typeof window !== 'undefined') {
  ;['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
    (event) => {
      window.addEventListener(event, resetActivityTimer, { passive: true })
    }
  )
  // Initial start
  resetActivityTimer()
}

export default socket
