import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/es/storage/session' // Use sessionStorage

import versesReducer, {
  addToHistory,
  addBookmark,
  removeBookmark,
  setCurrentReference,
  clearHistory,
  cacheVerses,
  clearCache,
  resetVersesState,
} from './versesSlice'
import configReducer, {
  setSelectedVersion,
  toggleDarkMode as toggleDarkModeConfig,
  setDarkMode as setDarkModeConfig,
  setPreferredVersion as setPreferredVersionConfig,
  setCurrentSectionIndex,
  setActiveGospelTab,
  setSelectedFont,
} from './configSlice'

// Redux persist configuration for session storage
const persistConfig = {
  key: 'fourfold-gospel-root',
  version: 1,
  storage, // Uses sessionStorage
  // Only persist these keys
  whitelist: [
    'bookmarks',
    'readingHistory',
    'preferredVersion',
    'darkMode',
    'currentSectionIndex',
    'config',
  ],
  // Don't persist these keys (transient data)
  // blacklist: ['loading', 'error', 'searchResults', 'cachedVerses'],
}

// Combine reducers (can add more slices here)
const rootReducer = combineReducers({
  verses: versesReducer,
  config: configReducer,
})

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
})

// Create persistor
export const persistor = persistStore(store)

// Selectors
export const selectVersesState = (state) => state.verses
export const selectBookmarks = (state) => state.verses.bookmarks
export const selectReadingHistory = (state) => state.verses.readingHistory
export const selectCachedVerses = (state) => state.verses.cachedVerses
export const selectCurrentReference = (state) => state.verses.currentReference
export const selectCurrentVersion = (state) => state.config.selectedVersion
export const selectPreferredVersion = (state) => state.config.preferredVersion
export const selectDarkMode = (state) => state.config.darkMode
export const selectLoading = (state) => state.verses.loading
export const selectError = (state) => state.verses.error
export const selectCurrentSectionIndex = (state) =>
  state.config.currentSectionIndex
export const selectActiveGospelTab = (state) => state.config.activeGospelTab
export const selectSelectedFont = (state) => state.config.selectedFont

// Check if a verse is bookmarked
export const selectIsBookmarked = (reference, version) => (state) => {
  return state.verses.bookmarks.some(
    (b) => b.reference === reference && b.version === version
  )
}

export {
  addToHistory,
  addBookmark,
  removeBookmark,
  resetVersesState,
  setCurrentReference,
  clearHistory,
  cacheVerses,
  clearCache,
  setSelectedVersion,
  toggleDarkModeConfig as toggleDarkMode,
  setDarkModeConfig as setDarkMode,
  setPreferredVersionConfig as setPreferredVersion,
  setCurrentSectionIndex,
  setActiveGospelTab,
  setSelectedFont,
}

// Flush persistence (useful for logout)
export const flushPersistence = () => {
  persistor.flush()
}

// Pause persistence
export const pausePersistence = () => {
  persistor.pause()
}

// Purge all persisted data
export const purgePersistence = () => {
  return persistor.purge()
}
