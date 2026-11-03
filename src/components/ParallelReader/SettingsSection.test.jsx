import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsSection from './SettingsSection'

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  isSmartphoneViewport: vi.fn(),
  loadExampleData: vi.fn(),
}))

vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: () => null,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, values) => {
      const translations = {
        'app.open_example': `Abrir modelo ${values?.name}`,
        'app.tap_to_load': 'Toque para carregar',
        'import.example_confirm_title': 'Carregar arquivo sugerido?',
        'import.example_confirm_description': `Você deseja carregar o arquivo "${values?.name}"?`,
        'import.example_confirm_action': 'Sim, carregar',
        'import.cancel': 'Cancelar',
        'import.processing': 'Processando...',
        'common.close': 'Fechar',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('@src/components/FileImport', () => ({
  default: () => <div>Importação manual</div>,
}))

vi.mock('@src/utils/exampleImport', () => ({
  isSmartphoneViewport: mocks.isSmartphoneViewport,
  loadExampleData: mocks.loadExampleData,
}))

describe('SettingsSection suggested files', () => {
  beforeEach(() => {
    mocks.dispatch.mockClear()
    mocks.isSmartphoneViewport.mockReturnValue(true)
    mocks.loadExampleData.mockResolvedValue({
      title: 'The Complete Gospels (Q)',
      sections: [],
    })
  })

  it('asks for confirmation and automatically imports on smartphones', async () => {
    render(<SettingsSection />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Abrir modelo The Complete Gospels (Q)',
      })
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sim, carregar' }))

    await waitFor(() => {
      expect(mocks.loadExampleData).toHaveBeenCalledWith(
        expect.objectContaining({ file: 'TheCompleteGospels-Q.csv' })
      )
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(mocks.dispatch).toHaveBeenCalled()
  })
})
