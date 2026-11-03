import { describe, it, expect, vi } from 'vitest'
import { retry } from './retry'

describe('retry', () => {
  it('returns the first successful result without retrying', async () => {
    const task = vi.fn().mockResolvedValue('ok')

    await expect(retry(task, 3)).resolves.toBe('ok')
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('retries after a failure and returns the later success', async () => {
    const task = vi
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockResolvedValue('ok')

    await expect(retry(task, 3)).resolves.toBe('ok')
    expect(task).toHaveBeenCalledTimes(3)
  })

  it('rejects with the last error once the attempts are exhausted', async () => {
    const task = vi
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('last'))

    await expect(retry(task, 2)).rejects.toThrow('last')
    expect(task).toHaveBeenCalledTimes(2)
  })

  it('stops retrying when shouldRetry says the error is final', async () => {
    const task = vi.fn().mockRejectedValue(new Error('aborted'))

    await expect(
      retry(task, 3, (error) => error.message !== 'aborted')
    ).rejects.toThrow('aborted')
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('rejects when the attempt count is not a positive number', async () => {
    await expect(retry(vi.fn(), 0)).rejects.toThrow(
      'attempts must be at least 1'
    )
  })
})
