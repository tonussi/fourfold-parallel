import { describe, it, expect } from 'vitest'
import reducer, {
  PRESET_PROMPTS,
  DEFAULT_PROMPT_ID,
  addPrompt,
  removePrompt,
  selectPrompts,
  OUTPUT_LANGUAGES,
  DEFAULT_LANGUAGE_ID,
  setActiveLanguage,
  selectActiveLanguage,
} from './aiSlice'

const stateOf = (ai) => ({ ai })
const userPrompt = { id: 'prompt-1', label: 'Mine', text: 'my prompt' }

describe('aiSlice prompts', () => {
  it('offers several preset prompts with unique ids and non-empty text', () => {
    const ids = PRESET_PROMPTS.map((p) => p.id)
    expect(PRESET_PROMPTS.length).toBeGreaterThan(1)
    expect(new Set(ids).size).toBe(ids.length)
    PRESET_PROMPTS.forEach((p) => {
      expect(p.id.startsWith('example-')).toBe(true)
      expect(p.label.trim()).not.toBe('')
      expect(p.text.trim()).not.toBe('')
    })
  })

  it('lists presets before the user saved prompts', () => {
    const state = reducer(undefined, addPrompt(userPrompt))
    const prompts = selectPrompts(stateOf(state))
    expect(prompts.slice(0, PRESET_PROMPTS.length)).toEqual(PRESET_PROMPTS)
    expect(prompts.at(-1)).toEqual(userPrompt)
  })

  it('shows presets to users whose persisted state predates them', () => {
    const legacy = {
      prompts: [
        { id: DEFAULT_PROMPT_ID, label: 'old', text: 'old text' },
        userPrompt,
      ],
    }
    const prompts = selectPrompts(stateOf(legacy))
    expect(prompts.filter((p) => p.id === DEFAULT_PROMPT_ID)).toHaveLength(1)
    expect(prompts.map((p) => p.id)).toEqual([
      ...PRESET_PROMPTS.map((p) => p.id),
      userPrompt.id,
    ])
  })

  it('falls back to the default preset when the active prompt is removed', () => {
    let state = reducer(undefined, addPrompt(userPrompt))
    state = reducer(state, removePrompt(userPrompt.id))
    expect(state.activePromptId).toBe(DEFAULT_PROMPT_ID)
  })
})

describe('aiSlice output language', () => {
  it('offers English, Chinese, Spanish and Portuguese', () => {
    expect(OUTPUT_LANGUAGES.map((l) => l.name)).toEqual([
      'English',
      'Chinese',
      'Spanish',
      'Portuguese',
    ])
  })

  it('defaults to English', () => {
    const state = reducer(undefined, { type: 'init' })
    expect(selectActiveLanguage(stateOf(state)).id).toBe(DEFAULT_LANGUAGE_ID)
    expect(selectActiveLanguage(stateOf(state)).name).toBe('English')
  })

  it('switches language and falls back to default for legacy state', () => {
    const state = reducer(undefined, setActiveLanguage('spanish'))
    expect(selectActiveLanguage(stateOf(state)).name).toBe('Spanish')
    expect(selectActiveLanguage(stateOf({ prompts: [] })).id).toBe(DEFAULT_LANGUAGE_ID)
  })

  it('ignores unknown languages', () => {
    const state = reducer(undefined, setActiveLanguage('klingon'))
    expect(state.activeLanguageId).toBe(DEFAULT_LANGUAGE_ID)
  })
})
