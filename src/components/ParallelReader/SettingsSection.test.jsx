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
        'import.example_load_error': 'Não foi possível carregar o arquivo sugerido.',
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

  it('automatically imports on smartphones after one tap', async () => {
    render(<SettingsSection />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Abrir modelo The Complete Gospels (Q)',
      })
    )
    await waitFor(() => {
      expect(mocks.loadExampleData).toHaveBeenCalledWith(
        expect.objectContaining({ file: 'TheCompleteGospels-Q.csv' })
      )
    })
    expect(mocks.dispatch).toHaveBeenCalled()
  })
})
