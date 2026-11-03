import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AlignedTextComparison from './AlignedTextComparison'

describe('AlignedTextComparison', () => {
  it('renders a word-by-word alignment for the selected gospel pair', () => {
    const { container } = render(
      <AlignedTextComparison
        pair="matthew-luke"
        versesByGospel={{
          matthew: [{ verse: 1, text: 'Ἐν ἀρχῇ ἦν ὁ λόγος' }],
          luke: [{ verse: 2, text: 'εν αρχη ἐστὶν λόγος θεός' }],
        }}
      />
    )

    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-alignment-type="match"]')).toHaveLength(3)
    expect(
      container.querySelectorAll('[data-alignment-type="substitution"]')
    ).toHaveLength(1)
    expect(
      container.querySelectorAll('[data-alignment-type="omission"]')
    ).toHaveLength(1)
    expect(
      container.querySelectorAll('[data-alignment-type="addition"]')
    ).toHaveLength(1)
    expect(screen.getByText('Ἐν')).toBeInTheDocument()
    expect(screen.getByText('θεός')).toBeInTheDocument()
  })

  it('shows an empty state when one gospel has no parallel passage', () => {
    render(
      <AlignedTextComparison
        pair="matthew-mark"
        versesByGospel={{ matthew: [{ verse: 1, text: 'λόγος' }] }}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
