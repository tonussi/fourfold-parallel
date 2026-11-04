import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  notes: [],
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    saveNote: (state, action) => {
      const note = action.payload
      const existing = state.notes.find((item) => item.id === note.id)
      const timestamp = new Date().toISOString()

      if (existing) {
        Object.assign(existing, note, { updatedAt: timestamp })
        return
      }

      state.notes.unshift({
        ...note,
        id: note.id || nanoid(),
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    },
    deleteNote: (state, action) => {
      state.notes = state.notes.filter((note) => note.id !== action.payload)
    },
  },
})

export const { saveNote, deleteNote } = notesSlice.actions
export const selectNotes = (state) => state.notes.notes
export default notesSlice.reducer
