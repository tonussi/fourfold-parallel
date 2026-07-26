import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedVersion: 'OGNT',
  darkMode: false,
  preferredVersion: 'OGNT',
  currentSectionIndex: 0,
  activeGospelTab: 'matthew',
  selectedFont: 'serif',
  importedData: null,
  importState: {
    status: 'idle', // 'idle' | 'loading' | 'completed' | 'failed'
    currentSection: 0,
    totalSections: 0,
    error: null,
  },
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setSelectedVersion: (state, action) => {
      state.selectedVersion = action.payload
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload
    },
    setPreferredVersion: (state, action) => {
      state.preferredVersion = action.payload
    },
    setCurrentSectionIndex: (state, action) => {
      state.currentSectionIndex = action.payload
    },
    setActiveGospelTab: (state, action) => {
      state.activeGospelTab = action.payload
    },
    setSelectedFont: (state, action) => {
      state.selectedFont = action.payload
    },
    setImportedData: (state, action) => {
      state.importedData = action.payload
    },
    startImport: (state, action) => {
      const { title, sections } = action.payload
      state.importedData = { title, sections }
      state.importState = {
        status: 'loading',
        currentSection: 0,
        totalSections: sections.length,
        error: null,
      }
    },
    updateImportProgress: (state, action) => {
      const { sectionIndex, passages } = action.payload
      if (state.importedData && state.importedData.sections[sectionIndex]) {
        state.importedData.sections[sectionIndex].passages = passages
        state.importedData.sections[sectionIndex].loaded = true
        const loadedCount = state.importedData.sections.filter((s) => s.loaded).length
        state.importState.currentSection = loadedCount
      }
    },
    completeImport: (state) => {
      state.importState.status = 'completed'
    },
    failImport: (state, action) => {
      state.importState.status = 'failed'
      state.importState.error = action.payload
    },
    resetImportState: (state) => {
      state.importState = {
        status: 'idle',
        currentSection: 0,
        totalSections: 0,
        error: null,
      }
    },
  },
})

export const selectCurrentSectionIndex = (state) =>
  state.config.currentSectionIndex
export const selectActiveGospelTab = (state) => state.config.activeGospelTab
export const selectSelectedFont = (state) => state.config.selectedFont
export const selectImportedData = (state) => state.config.importedData
export const selectImportState = (state) => state.config.importState

export const {
  setSelectedVersion,
  toggleDarkMode,
  setDarkMode,
  setPreferredVersion,
  setCurrentSectionIndex,
  setActiveGospelTab,
  setSelectedFont,
  setImportedData,
  startImport,
  updateImportProgress,
  completeImport,
  failImport,
  resetImportState,
} = configSlice.actions

export default configSlice.reducer
