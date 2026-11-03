import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TextAlignmentToggle from './TextAlignmentToggle'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) =>
      ({
        'nav.text_alignment': 'Alinhamento do texto',
        'nav.align_left': 'Alinhar à esquerda',
        'nav.align_justify': 'Justificar texto',
      })[key] || key,
  }),
}))

describe('TextAlignmentToggle', () => {
  it('switches from left aligned to justified text', () => {
    const onChange = vi.fn()

    render(<TextAlignmentToggle value="left" onChange={onChange} />)

    const toggle = screen.getByRole('button', { name: 'Justificar texto' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(toggle)

    expect(onChange).toHaveBeenCalledWith('justify')
  })

  it('switches from justified text to left aligned text', () => {
    const onChange = vi.fn()

    render(<TextAlignmentToggle value="justify" onChange={onChange} />)

    const toggle = screen.getByRole('button', {
      name: 'Alinhar à esquerda',
    })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(toggle)

    expect(onChange).toHaveBeenCalledWith('left')
  })
})
