import { useState } from 'react'
import { generateWithOpenRouter } from '../lib/ai'

export default function AITest() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const { text } = await generateWithOpenRouter(
        'Explain the fourfold gospel in 2 sentences.',
        { model: 'anthropic/claude-sonnet-4' }
      )
      setResult(text)
    } catch (err) {
      setError(err.message)
      console.error('AI Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2">AI Test (OpenRouter)</h2>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Test Connection'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <strong>Result:</strong>
          <p className="mt-2">{result}</p>
        </div>
      )}
    </div>
  )
}
