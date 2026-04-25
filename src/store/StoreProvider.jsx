import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './index'

// Loading component shown while rehydrating from session storage
const PersistLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        <svg
          className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="text-slate-600 dark:text-slate-400">
        Loading your preferences...
      </p>
    </div>
  </div>
)

/**
 * StoreProvider - Wraps the app with Redux Provider and PersistGate
 *
 * Session Storage Persistence:
 * - Bookmarks/favorites are persisted
 * - Reading history is maintained
 * - Preferred Bible version is remembered
 * - Dark mode preference is saved
 * - Current section index is restored
 *
 * Data is cleared when the browser tab is closed.
 */
export function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default StoreProvider
