import { describe, expect, it, vi } from 'vitest'
import { loadExampleData } from './exampleImport'

const EXAMPLE = {
  name: 'Modelo Sinótico',
  file: 'modelo sinotico.csv',
}

describe('loadExampleData', () => {
  it('fetches, parses and names a suggested CSV file', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          'Title,Matthew,Mark,Luke,John\nParábola,13:1-9,4:1-9,8:4-8,'
        ),
    })

    const result = await loadExampleData(EXAMPLE, {
      fetchImpl,
      origin: 'https://fourfold.test',
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://fourfold.test/assets/examples/modelo%20sinotico.csv',
      { signal: undefined }
    )
    expect(result.title).toBe('Modelo Sinótico')
    expect(result.sections).toHaveLength(1)
  })

  it('rejects a suggested file that cannot be downloaded', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 404 })

    await expect(
      loadExampleData(EXAMPLE, {
        fetchImpl,
        origin: 'https://fourfold.test',
      })
    ).rejects.toThrow('404')
  })
})
