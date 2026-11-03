import { parseCSV, validateStructure } from './importUtils'

const SMARTPHONE_QUERY = '(max-width: 767px)'

const getBrowserOrigin = () =>
  typeof window === 'undefined' ? '' : window.location.origin

export const isSmartphoneViewport = (browserWindow = window) =>
  browserWindow.matchMedia?.(SMARTPHONE_QUERY).matches ??
  browserWindow.innerWidth < 768

export const loadExampleData = async (
  example,
  {
    fetchImpl = fetch,
    origin = getBrowserOrigin(),
    signal,
  } = {}
) => {
  if (!example?.file || !example?.name) {
    throw new Error('Invalid suggested file')
  }

  const filename = encodeURIComponent(example.file)
  const response = await fetchImpl(`${origin}/assets/examples/${filename}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Unable to download suggested file (${response.status})`)
  }

  const csvData = parseCSV(await response.text())
  const validation = validateStructure(csvData)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  return { ...csvData, title: example.name }
}
