import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchVerses } from '../verses'

// Async thunks for API calls
export const fetchVerseContent = createAsyncThunk(
  'verses/fetchVerseContent',
  async ({ reference, version }, { getState, rejectWithValue }) => {
    try {
      const selectedVersion =
        version || getState().config.selectedVersion || 'OGNT'
      const data = await fetchVerses(reference, selectedVersion)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const versesSlice = createSlice({
  name: 'verses',
  initialState: {
    // Cached verses by reference
    cachedVerses: {},
    // Current selection
    currentReference: null,
    // UI state
    loading: false,
    error: null,
    // Reader state (moved to config slice)
    // Bookmarks/Favorites (persisted)
    bookmarks: [],
    // Reading history
    readingHistory: [],
  },
  reducers: {
    setCurrentReference: (state, action) => {
      state.currentReference = action.payload
    },
    addBookmark: (state, action) => {
      const bookmark = action.payload
      const exists = state.bookmarks.some(
        (b) =>
          b.reference === bookmark.reference && b.version === bookmark.version
      )
      if (!exists) {
        state.bookmarks.push({
          ...bookmark,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        })
      }
    },
    removeBookmark: (state, action) => {
      const bookmarkId = action.payload
      state.bookmarks = state.bookmarks.filter((b) => b.id !== bookmarkId)
    },
    addToHistory: (state, action) => {
      const entry = action.payload
      // Remove if already exists (move to top)
      state.readingHistory = state.readingHistory.filter(
        (h) => h.reference !== entry.reference
      )
      // Add to beginning
      state.readingHistory.unshift({
        ...entry,
        accessedAt: new Date().toISOString(),
      })
      // Limit to 50 entries
      if (state.readingHistory.length > 50) {
        state.readingHistory = state.readingHistory.slice(0, 50)
      }
    },
    clearHistory: (state) => {
      state.readingHistory = []
    },
    // Cache management
    cacheVerses: (state, action) => {
      const { reference, data } = action.payload
      state.cachedVerses[reference] = {
        ...data,
        cachedAt: new Date().toISOString(),
      }
    },
    clearCache: (state) => {
      state.cachedVerses = {}
    },
    // Reset state
    resetVersesState: (state) => {
      state.cachedVerses = {}
      state.searchResults = []
      state.searchQuery = ''
      state.currentReference = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch verses
    builder
      .addCase(fetchVerseContent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVerseContent.fulfilled, (state, action) => {
        state.loading = false
        const { reference, verses } = action.payload
        if (reference && verses) {
          state.cachedVerses[reference] = action.payload
        }
      })
      .addCase(fetchVerseContent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch verses'
      })
  },
})

export const {
  setCurrentReference,
  addBookmark,
  removeBookmark,
  addToHistory,
  clearHistory,
  cacheVerses,
  clearCache,
  resetVersesState,
} = versesSlice.actions

export default versesSlice.reducer
