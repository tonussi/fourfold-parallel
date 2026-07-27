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
import localStorageEngine from 'redux-persist/es/storage' // localStorage (key 'fourfold-ai-root')

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
  setImportedData,
  startImport,
  updateImportProgress,
  completeImport,
  failImport,
  resetImportState,
} from './configSlice'
import aiReducer, {
  addProvider,
  removeProvider,
  setActiveProvider,
  addPrompt,
  removePrompt,
  setActivePrompt,
  resetAI,
} from './aiSlice'

// Persist config for verses slice (sessionStorage)
const versesPersistConfig = {
  key: 'fourfold-verses-root',
  version: 1,
  storage,
  whitelist: ['bookmarks', 'readingHistory', 'currentReference'],
}

// Persist config for config slice (sessionStorage)
const configPersistConfig = {
  key: 'fourfold-config-root',
  version: 1,
  storage,
  whitelist: [
    'preferredVersion',
    'darkMode',
    'currentSectionIndex',
  ],
}

// AI slice persists to localStorage (separate key from sessionStorage slices)
const aiPersistConfig = {
  key: 'fourfold-ai-root',
  version: 1,
  storage: localStorageEngine,
}

const persistedVersesReducer = persistReducer(versesPersistConfig, versesReducer)
const persistedConfigReducer = persistReducer(configPersistConfig, configReducer)
const persistedAiReducer = persistReducer(aiPersistConfig, aiReducer)

// Combine reducers (can add more slices here)
const rootReducer = combineReducers({
  verses: persistedVersesReducer,
  config: persistedConfigReducer,
  ai: persistedAiReducer,
})

// Configure store
export const store = configureStore({
  reducer: rootReducer,
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
export const selectImportedData = (state) => state.config.importedData
export const selectImportState = (state) => state.config.importState

// AI selectors
export {
  selectProviders,
  selectPrompts,
  selectActiveProviderId,
  selectActivePromptId,
  selectActiveProvider,
  selectActivePrompt,
} from './aiSlice'

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
  setImportedData,
  startImport,
  updateImportProgress,
  completeImport,
  failImport,
  resetImportState,
  addProvider,
  removeProvider,
  setActiveProvider,
  addPrompt,
  removePrompt,
  setActivePrompt,
  resetAI,
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
