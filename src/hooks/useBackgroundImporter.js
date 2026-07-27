import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { store } from '@src/store'
import {
  selectImportState,
  selectImportedData,
  selectCurrentVersion,
  selectCurrentSectionIndex,
  updateImportProgress,
  completeImport,
  failImport,
} from '@src/store'
import { normalizeVerses, fetchVerseContent } from '@src/utils/importUtils'

let currentImportId = 0

// Capped-concurrency pool: prevents 4-way spam per section
const runPool = async (items, limit, worker) => {
  const results = new Array(items.length)
  let next = 0
  const launch = async () => {
    while (true) {
      const i = next++
      if (i >= items.length) return
      try {
        results[i] = await worker(items[i], i)
      } catch (e) {
        results[i] = { __error: e }
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, launch)
  )
  return results
}

export function useBackgroundImporter() {
  const dispatch = useDispatch()
  const importState = useSelector(selectImportState)
  const importedData = useSelector(selectImportedData)
  const selectedVersion = useSelector(selectCurrentVersion)
  const currentSectionIndex = useSelector(selectCurrentSectionIndex)

  useEffect(() => {
    if (importState.status !== 'loading' || !importedData) {
      currentImportId++ // Cancel any active loop
      return
    }

    const importId = ++currentImportId

    const loadSection = async (sectionIndex) => {
      const importedDataNow = store.getState().config.importedData
      if (!importedDataNow) return false
      const section = importedDataNow.sections[sectionIndex]
      if (!section || section.loaded) return true // already done

      if (importId !== currentImportId) return false

      const passagesWithVerses = await runPool(
        section.passages,
        4,
        async (passage) => {
          if (importId !== currentImportId) throw new Error('cancelled')
          const versesStr =
            typeof passage.verses === 'string' ? passage.verses : ''
          const normalizedVersesStr = normalizeVerses(versesStr)

          if (!normalizedVersesStr) {
            return { ...passage, reference: '', verses: [] }
          }

          const { reference, verses } = await fetchVerseContent(
            passage.gospel,
            normalizedVersesStr,
            selectedVersion
          )

          return {
            ...passage,
            reference,
            verses: verses.map((v) => ({ verse: v.verse, text: v.text })),
          }
        }
      )

      if (importId !== currentImportId) return false

      // Filter out cancelled slots from results
      const valid = passagesWithVerses.filter((p) => p && !p.__error)

      dispatch(
        updateImportProgress({
          sectionIndex,
          passages: valid,
        })
      )

      // Yield so React can re-render between sections
      await new Promise((resolve) => setTimeout(resolve, 0))
      return importId === currentImportId
    }

    const runImport = async () => {
      try {
        // On-demand: load currently visible section first, then next, then backfill
        let sections = store.getState().config.importedData?.sections || []
        const total = sections.length

        // Priority load: current, current+1, then sequential from 0
        const ordered = []
        if (currentSectionIndex >= 0 && currentSectionIndex < total) {
          ordered.push(currentSectionIndex)
          if (currentSectionIndex + 1 < total) ordered.push(currentSectionIndex + 1)
        }
        for (let i = 0; i < total; i++) {
          if (!ordered.includes(i)) ordered.push(i)
        }

        for (const idx of ordered) {
          const ok = await loadSection(idx)
          if (!ok) return

          // Stop if import was reset/cancelled
          const stateNow = store.getState().config
          if (stateNow.importState.status !== 'loading') return
          if (!stateNow.importedData) return
        }

        if (importId !== currentImportId) return

        const finalImportedData = store.getState().config.importedData
        if (
          finalImportedData &&
          finalImportedData.sections.every((s) => s.loaded)
        ) {
          dispatch(completeImport())
        }
      } catch (err) {
        if (importId === currentImportId) {
          console.error('Background import failed:', err)
          dispatch(
            failImport(err.message || 'Unknown error occurred during import')
          )
        }
      }
    }

    runImport()
  }, [
    importState.status,
    importedData,
    selectedVersion,
    currentSectionIndex,
    dispatch,
  ])
}
