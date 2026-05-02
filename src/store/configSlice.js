import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedVersion: 'BYZ',
  darkMode: false,
  preferredVersion: 'BYZ',
  currentSectionIndex: 0,
  activeGospelTab: 'matthew',
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
  },
})

export const selectCurrentSectionIndex = (state) =>
  state.config.currentSectionIndex
export const selectActiveGospelTab = (state) => state.config.activeGospelTab

export const {
  setSelectedVersion,
  toggleDarkMode,
  setDarkMode,
  setPreferredVersion,
  setCurrentSectionIndex,
  setActiveGospelTab,
} = configSlice.actions

export default configSlice.reducer
