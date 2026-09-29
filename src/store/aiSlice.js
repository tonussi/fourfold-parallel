import { createSlice, createSelector } from '@reduxjs/toolkit'

const DEFAULT_PROVIDERS = [
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/new' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/' },
]

export const DEFAULT_PROMPT_ID = 'example-iliad'
const DEFAULT_PROVIDER_ID = 'claude'

export const PRESET_PROMPTS = [
  {
    id: DEFAULT_PROMPT_ID,
    label: 'Iliad & Odyssey parallels',
    text: 'Compare these verses with iliad and odissey (homer) and tell me if you find any similar story there',
  },
  {
    id: 'example-gospel-differences',
    label: 'Differences between the Gospels',
    text: 'Compare how each Gospel tells this passage. List what each one includes, omits or emphasizes, and explain possible reasons for the differences.',
  },
  {
    id: 'example-historical-context',
    label: 'Historical & cultural context',
    text: 'Explain the historical, political, religious and cultural context of these verses in first-century Judea, including customs or places a modern reader might miss.',
  },
  {
    id: 'example-old-testament',
    label: 'Old Testament connections',
    text: 'Identify the Old Testament quotations, allusions and themes present in these verses and explain how the Gospel writers use them.',
  },
  {
    id: 'example-original-language',
    label: 'Original Greek key words',
    text: 'Pick the most important Greek words in these verses. For each one, give the transliteration, the range of meanings and how the choice of translation changes the sense.',
  },
  {
    id: 'example-summary',
    label: 'Simple summary',
    text: 'Summarize these verses in plain language in a few sentences, then list the key people, places and events.',
  },
  {
    id: 'example-themes',
    label: 'Theological themes',
    text: 'What are the main theological themes in these verses? Explain how each one connects to the wider message of the Gospels.',
  },
  {
    id: 'example-application',
    label: 'Reflection questions',
    text: 'Write five reflection questions for a small group study of these verses, from observation to personal application.',
  },
]

export const DEFAULT_LANGUAGE_ID = 'english'

export const OUTPUT_LANGUAGES = [
  { id: DEFAULT_LANGUAGE_ID, name: 'English' },
  { id: 'chinese', name: 'Chinese' },
  { id: 'spanish', name: 'Spanish' },
  { id: 'portuguese', name: 'Portuguese' },
]

const PRESET_PROMPT_IDS = new Set(PRESET_PROMPTS.map((p) => p.id))

const initialState = {
  providers: DEFAULT_PROVIDERS,
  prompts: [],
  activeProviderId: DEFAULT_PROVIDER_ID,
  activePromptId: DEFAULT_PROMPT_ID,
  activeLanguageId: DEFAULT_LANGUAGE_ID,
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
        state.activePromptId = DEFAULT_PROMPT_ID
      }
    },
    setActivePrompt: (state, action) => {
      state.activePromptId = action.payload
    },
    setActiveLanguage: (state, action) => {
      if (OUTPUT_LANGUAGES.some((l) => l.id === action.payload)) {
        state.activeLanguageId = action.payload
      }
    },
    resetAI: () => initialState,
  },
})

export const selectProviders = (state) => state.ai?.providers || DEFAULT_PROVIDERS
const selectUserPrompts = (state) => state.ai?.prompts || initialState.prompts
export const selectPrompts = createSelector([selectUserPrompts], (userPrompts) => [
  ...PRESET_PROMPTS,
  ...userPrompts.filter((p) => !PRESET_PROMPT_IDS.has(p.id)),
])
export const selectActiveProviderId = (state) =>
  state.ai?.activeProviderId || DEFAULT_PROVIDER_ID
export const selectActivePromptId = (state) =>
  state.ai?.activePromptId || DEFAULT_PROMPT_ID

export const selectActiveLanguage = (state) =>
  OUTPUT_LANGUAGES.find((l) => l.id === state.ai?.activeLanguageId) ||
  OUTPUT_LANGUAGES[0]

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
  setActiveLanguage,
  resetAI,
} = aiSlice.actions

export default aiSlice.reducer
