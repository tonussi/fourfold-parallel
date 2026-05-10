import { io } from 'socket.io-client'

/**
 * Resolve the bible-api WebSocket URL from environment variables.
 * Uses the same env vars the REST layer already relies on.
 */
function getSocketUrl() {
  if (import.meta.env.VITE_BIBLE_API_INTERNAL_URL) {
    return import.meta.env.VITE_BIBLE_API_INTERNAL_URL
  }
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

export default socket
