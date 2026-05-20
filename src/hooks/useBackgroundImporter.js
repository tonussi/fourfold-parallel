import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { store } from '@src/store'
import {
  selectImportState,
  selectImportedData,
  selectCurrentVersion,
  updateImportProgress,
  completeImport,
  failImport,
} from '@src/store'
import { normalizeVerses, fetchVerseContent } from '@src/utils/importUtils'

let currentImportId = 0

export function useBackgroundImporter() {
  const dispatch = useDispatch()
  const importState = useSelector(selectImportState)
  const importedData = useSelector(selectImportedData)
  const selectedVersion = useSelector(selectCurrentVersion)

  useEffect(() => {
    if (importState.status !== 'loading' || !importedData) {
      currentImportId++ // Cancel any active loop
      return
    }

    const importId = ++currentImportId

    const runImport = async () => {
      try {
        let currentImportedData = store.getState().config.importedData
        if (!currentImportedData) return
        let sections = currentImportedData.sections
        let nextIndex = sections.findIndex((s) => !s.loaded)

        while (nextIndex !== -1) {
          // Check if we were cancelled
          if (importId !== currentImportId) {
            return
          }

          const section = sections[nextIndex]

          const passagesWithVerses = await Promise.all(
            section.passages.map(async (passage) => {
              const versesStr = typeof passage.verses === 'string' ? passage.verses : ''
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
            })
          )

          // Check if we were cancelled during async fetch
          if (importId !== currentImportId) {
            return
          }

          // Dispatch progress update for this section
          dispatch(
            updateImportProgress({
              sectionIndex: nextIndex,
              passages: passagesWithVerses,
            })
          )

          // Wait a tick for dispatch to settle
          await new Promise((resolve) => setTimeout(resolve, 0))

          // Read the updated state from Redux store
          const updatedImportedData = store.getState().config.importedData
          if (!updatedImportedData) {
            break
          }
          sections = updatedImportedData.sections
          nextIndex = sections.findIndex((s) => !s.loaded)
        }

        // Check if we were cancelled before marking complete
        if (importId !== currentImportId) {
          return
        }

        // Check if all sections are indeed loaded
        const finalImportedData = store.getState().config.importedData
        if (finalImportedData && finalImportedData.sections.every((s) => s.loaded)) {
          dispatch(completeImport())
        }
      } catch (err) {
        if (importId === currentImportId) {
          console.error('Background import failed:', err)
          dispatch(failImport(err.message || 'Unknown error occurred during import'))
        }
      }
    }

    runImport()
  }, [importState.status, importedData, selectedVersion, dispatch])
}
