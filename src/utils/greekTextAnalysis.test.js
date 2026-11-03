import { describe, expect, it } from 'vitest'
import {
  alignGreekVerses,
  normalizeGreekWord,
  tokenizeGreekVerses,
} from './greekTextAnalysis'

describe('greekTextAnalysis', () => {
  it('tokenizes complete polytonic Greek words without punctuation', () => {
    expect(
      tokenizeGreekVerses([
        { verse: 1, text: 'Ἐν ἀρχῇ ἦν ὁ Λόγος·' },
      ])
    ).toEqual([
      { text: 'Ἐν', normalized: 'εν', verse: 1 },
      { text: 'ἀρχῇ', normalized: 'αρχη', verse: 1 },
      { text: 'ἦν', normalized: 'ην', verse: 1 },
      { text: 'ὁ', normalized: 'ο', verse: 1 },
      { text: 'Λόγος', normalized: 'λογος', verse: 1 },
    ])
  })

  it('normalizes Greek case and diacritics consistently', () => {
    expect(normalizeGreekWord('Λόγος')).toBe(normalizeGreekWord('λογος'))
  })

  it('aligns matches, substitutions, omissions, and additions', () => {
    const alignment = alignGreekVerses(
      [{ verse: 1, text: 'Ἐν ἀρχῇ ἦν ὁ λόγος' }],
      [{ verse: 2, text: 'εν αρχη ἐστὶν λόγος θεός' }]
    )

    expect(alignment.rows.map((row) => row.type)).toEqual([
      'match',
      'match',
      'substitution',
      'omission',
      'match',
      'addition',
    ])
    expect(alignment.summary).toEqual({
      match: 3,
      substitution: 1,
      omission: 1,
      addition: 1,
      movement: 0,
    })
  })

  it('identifies the same word moved to another position', () => {
    const alignment = alignGreekVerses(
      [{ verse: 1, text: 'alpha beta gamma' }],
      [{ verse: 2, text: 'beta alpha gamma' }]
    )

    expect(alignment.summary.movement).toBe(1)
    expect(alignment.rows.filter((row) => row.type === 'movement')).toHaveLength(
      2
    )
    expect(alignment.summary.omission).toBe(0)
    expect(alignment.summary.addition).toBe(0)
  })
})
