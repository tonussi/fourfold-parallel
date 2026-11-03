import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ConfirmExampleImportDialog from './ConfirmExampleImportDialog'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, values) =>
      ({
        'import.example_confirm_title': 'Carregar arquivo sugerido?',
        'import.example_confirm_description': `Deseja carregar ${values?.name}?`,
        'import.example_confirm_action': 'Sim, carregar',
        'import.cancel': 'Cancelar',
        'import.processing': 'Processando...',
        'common.close': 'Fechar',
      })[key] || key,
  }),
}))

const EXAMPLE = { name: 'The Complete Gospels', file: 'gospels.csv' }

describe('ConfirmExampleImportDialog', () => {
  it('confirms or cancels loading the selected example', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmExampleImportDialog
        example={EXAMPLE}
        loading={false}
        error={null}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Deseja carregar The Complete Gospels?'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sim, carregar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('locks the dialog while the suggested file is loading', () => {
    render(
      <ConfirmExampleImportDialog
        example={EXAMPLE}
        loading
        error="Falha ao carregar"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar')
    expect(screen.getByRole('button', { name: 'Processando...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})
