import { createSlice } from '@reduxjs/toolkit'

const DEFAULT_PROVIDERS = [
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/new' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/' },
]

const EXAMPLE_PROMPT =
  'compare these verses with iliad and odissey (homer) and tell me if you find any similar story there'

const initialState = {
  providers: DEFAULT_PROVIDERS,
  prompts: [
    { id: 'example-iliad', label: 'Iliad & Odyssey parallels', text: EXAMPLE_PROMPT },
  ],
  activeProviderId: 'claude',
  activePromptId: 'example-iliad',
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addProvider: (state, action) => {
      const exists = state.providers.some((p) => p.id === action.payload.id)
      if (!exists) state.providers.push(action.payload)
    },
    removeProvider: (state, action) => {
      state.providers = state.providers.filter((p) => p.id !== action.payload)
    },
    setActiveProvider: (state, action) => {
      state.activeProviderId = action.payload
    },
    addPrompt: (state, action) => {
      const { id, label, text } = action.payload
      if (!text || !text.trim()) return
      const promptId = id || `prompt-${Date.now()}`
      const existing = state.prompts.find((p) => p.id === promptId)
      if (existing) {
        existing.label = label || existing.label
        existing.text = text
      } else {
        state.prompts.push({
          id: promptId,
          label: label || text.slice(0, 40),
          text,
        })
      }
      state.activePromptId = promptId
    },
    removePrompt: (state, action) => {
      state.prompts = state.prompts.filter((p) => p.id !== action.payload)
      if (state.activePromptId === action.payload) {
        state.activePromptId = state.prompts[0]?.id || ''
      }
    },
    setActivePrompt: (state, action) => {
      state.activePromptId = action.payload
    },
    resetAI: () => initialState,
  },
})

export const selectProviders = (state) => state.ai?.providers || DEFAULT_PROVIDERS
export const selectPrompts = (state) => state.ai?.prompts || initialState.prompts
export const selectActiveProviderId = (state) =>
  state.ai?.activeProviderId || 'claude'
export const selectActivePromptId = (state) =>
  state.ai?.activePromptId || 'example-iliad'

export const selectActiveProvider = (state) => {
  const providers = selectProviders(state)
  const id = selectActiveProviderId(state)
  return providers.find((p) => p.id === id) || providers[0]
}

export const selectActivePrompt = (state) => {
  const prompts = selectPrompts(state)
  const id = selectActivePromptId(state)
  return prompts.find((p) => p.id === id) || prompts[0]
}

export const {
  addProvider,
  removeProvider,
  setActiveProvider,
  addPrompt,
  removePrompt,
  setActivePrompt,
  resetAI,
} = aiSlice.actions

export default aiSlice.reducer
