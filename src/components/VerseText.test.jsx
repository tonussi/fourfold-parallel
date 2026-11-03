import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import VerseText from './VerseText'

describe('VerseText', () => {
  it('makes a complete polytonic Greek word selectable', () => {
    const onWordClick = vi.fn()

    render(
      <VerseText
        text="Ἐν ἀρχῇ ἦν ὁ λόγος"
        highlightedWord={null}
        onWordClick={onWordClick}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'ἀρχῇ' }))

    expect(onWordClick).toHaveBeenCalledWith('ἀρχῇ')
  })

  it('highlights equivalent Greek words regardless of case and diacritics', () => {
    render(
      <VerseText
        text="Λόγος λογος"
        highlightedWord="λόγος"
        onWordClick={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Λόγος' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'λογος' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('toggles the selected word with click and keyboard', () => {
    const onWordClick = vi.fn()

    render(
      <VerseText
        text="λόγος"
        highlightedWord="λόγος"
        onWordClick={onWordClick}
      />
    )

    const word = screen.getByRole('button', { name: 'λόγος' })
    fireEvent.click(word)
    fireEvent.keyDown(word, { key: 'Enter' })
    fireEvent.keyDown(word, { key: ' ' })

    expect(onWordClick).toHaveBeenNthCalledWith(1, null)
    expect(onWordClick).toHaveBeenNthCalledWith(2, null)
    expect(onWordClick).toHaveBeenNthCalledWith(3, null)
  })

  it('highlights the same complete word across all four gospels', () => {
    const ParallelGospels = () => {
      const [highlightedWord, setHighlightedWord] = useState(null)
      const passages = [
        'καὶ ὁ λόγος ἦν',
        'ἀρχὴ λόγος λόγου',
        'περὶ λόγος',
        'καὶ θεὸς ἦν ὁ λόγος λόγου',
      ]

      return passages.map((text, index) => (
        <VerseText
          key={index}
          text={text}
          highlightedWord={highlightedWord}
          onWordClick={setHighlightedWord}
        />
      ))
    }

    render(<ParallelGospels />)

    fireEvent.click(screen.getAllByRole('button', { name: 'λόγος' })[0])

    expect(screen.getAllByRole('button', { name: 'λόγος' })).toHaveLength(4)
    screen.getAllByRole('button', { name: 'λόγος' }).forEach((word) => {
      expect(word).toHaveAttribute('aria-pressed', 'true')
    })
    screen.getAllByRole('button', { name: 'λόγου' }).forEach((word) => {
      expect(word).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
