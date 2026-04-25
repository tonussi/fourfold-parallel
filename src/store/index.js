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
import storage from 'redux-persist/lib/storage/session' // Use sessionStorage

import versesReducer, {
  setCurrentSectionIndex,
  setActiveGospelTab,
  setSearchQuery,
  clearSearchResults,
  addToHistory,
  addBookmark,
  removeBookmark,
  setPreferredVersion,
  setCurrentReference,
  setCurrentVersion,
  toggleDarkMode,
  setDarkMode,
  clearHistory,
  cacheVerses,
  clearCache,
  resetVersesState,
} from './versesSlice'

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
  ],
  // Don't persist these keys (transient data)
  // blacklist: ['loading', 'error', 'searchResults', 'cachedVerses'],
}

// Combine reducers (can add more slices here)
const rootReducer = combineReducers({
  verses: versesReducer,
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
export const selectSearchResults = (state) => state.verses.searchResults
export const selectSearchQuery = (state) => state.verses.searchQuery
export const selectCurrentReference = (state) => state.verses.currentReference
export const selectCurrentVersion = (state) => state.verses.currentVersion
export const selectPreferredVersion = (state) => state.verses.preferredVersion
export const selectDarkMode = (state) => state.verses.darkMode
export const selectLoading = (state) => state.verses.loading
export const selectError = (state) => state.verses.error
export const selectCurrentSectionIndex = (state) =>
  state.verses.currentSectionIndex
export const selectActiveGospelTab = (state) => state.verses.activeGospelTab

// Check if a verse is bookmarked
export const selectIsBookmarked = (reference, version) => (state) => {
  return state.verses.bookmarks.some(
    (b) => b.reference === reference && b.version === version
  )
}

// Action creators
export {
  setCurrentSectionIndex,
  setActiveGospelTab,
  setSearchQuery,
  clearSearchResults,
  addToHistory,
  addBookmark,
  removeBookmark,
  setPreferredVersion,
  setCurrentReference,
  setCurrentVersion,
  toggleDarkMode,
  setDarkMode,
  clearHistory,
  cacheVerses,
  clearCache,
  resetVersesState,
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
