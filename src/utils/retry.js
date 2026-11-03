export const retry = async (task, attempts, shouldRetry = () => true) => {
  if (attempts < 1) {
    throw new Error('attempts must be at least 1')
  }

  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await task()
    } catch (error) {
      lastError = error
      if (!shouldRetry(error)) break
    }
  }
  throw lastError
}
