const WORD_PATTERN = /[\p{L}\p{M}\p{N}]+/gu
const DIACRITIC_PATTERN = /\p{M}/gu
const GAP_COST = 10

export const normalizeGreekWord = (word) =>
  word
    .normalize('NFD')
    .replace(DIACRITIC_PATTERN, '')
    .toLocaleLowerCase('el')

export const tokenizeGreekVerses = (verses = []) =>
  verses.flatMap((verse) => {
    const text = verse.text || verse.scripture || ''
    return (text.match(WORD_PATTERN) || []).map((word) => ({
      text: word,
      normalized: normalizeGreekWord(word),
      verse: verse.verse,
    }))
  })

const levenshteinDistance = (left, right) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    const current = [leftIndex]
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] +
          (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      )
    }
    previous.splice(0, previous.length, ...current)
  }

  return previous[right.length]
}

const getSubstitutionCost = (leftToken, rightToken) => {
  if (leftToken.normalized === rightToken.normalized) return 0

  const longestLength = Math.max(
    leftToken.normalized.length,
    rightToken.normalized.length
  )
  const distance = levenshteinDistance(
    leftToken.normalized,
    rightToken.normalized
  )

  return GAP_COST + Math.round((distance / longestLength) * GAP_COST)
}

const createDistanceMatrix = (leftTokens, rightTokens) => {
  const matrix = Array.from({ length: leftTokens.length + 1 }, () =>
    new Array(rightTokens.length + 1).fill(0)
  )

  for (let leftIndex = 0; leftIndex <= leftTokens.length; leftIndex++) {
    matrix[leftIndex][0] = leftIndex * GAP_COST
  }
  for (let rightIndex = 0; rightIndex <= rightTokens.length; rightIndex++) {
    matrix[0][rightIndex] = rightIndex * GAP_COST
  }

  for (let leftIndex = 1; leftIndex <= leftTokens.length; leftIndex++) {
    for (let rightIndex = 1; rightIndex <= rightTokens.length; rightIndex++) {
      const substitutionCost = getSubstitutionCost(
        leftTokens[leftIndex - 1],
        rightTokens[rightIndex - 1]
      )

      matrix[leftIndex][rightIndex] = Math.min(
        matrix[leftIndex - 1][rightIndex - 1] + substitutionCost,
        matrix[leftIndex - 1][rightIndex] + GAP_COST,
        matrix[leftIndex][rightIndex - 1] + GAP_COST
      )
    }
  }

  return matrix
}

const buildAlignmentRows = (leftTokens, rightTokens, matrix) => {
  const rows = []
  let leftIndex = leftTokens.length
  let rightIndex = rightTokens.length

  while (leftIndex > 0 || rightIndex > 0) {
    const leftToken = leftTokens[leftIndex - 1]
    const rightToken = rightTokens[rightIndex - 1]
    const isMatch =
      leftIndex > 0 &&
      rightIndex > 0 &&
      leftToken.normalized === rightToken.normalized

    if (
      isMatch &&
      matrix[leftIndex][rightIndex] === matrix[leftIndex - 1][rightIndex - 1]
    ) {
      rows.push({ type: 'match', left: leftToken, right: rightToken })
      leftIndex--
      rightIndex--
      continue
    }

    if (
      leftIndex > 0 &&
      rightIndex > 0 &&
      matrix[leftIndex][rightIndex] ===
        matrix[leftIndex - 1][rightIndex - 1] +
          getSubstitutionCost(leftToken, rightToken)
    ) {
      rows.push({ type: 'substitution', left: leftToken, right: rightToken })
      leftIndex--
      rightIndex--
      continue
    }

    if (
      leftIndex > 0 &&
      matrix[leftIndex][rightIndex] ===
        matrix[leftIndex - 1][rightIndex] + GAP_COST
    ) {
      rows.push({ type: 'omission', left: leftToken, right: null })
      leftIndex--
      continue
    }

    rows.push({ type: 'addition', left: null, right: rightToken })
    rightIndex--
  }

  return rows.reverse()
}

const identifyMovements = (alignmentRows) => {
  const rows = alignmentRows.map((row) => ({ ...row }))
  const additionsByWord = new Map()

  rows.forEach((row, index) => {
    if (row.type !== 'addition') return
    const indexes = additionsByWord.get(row.right.normalized) || []
    indexes.push(index)
    additionsByWord.set(row.right.normalized, indexes)
  })

  let movementCount = 0
  rows.forEach((row, omissionIndex) => {
    if (row.type !== 'omission') return
    const additionIndexes = additionsByWord.get(row.left.normalized)
    const additionIndex = additionIndexes?.shift()
    if (additionIndex === undefined) return

    const movementId = `movement-${movementCount}`
    rows[omissionIndex] = { ...row, type: 'movement', movementId }
    rows[additionIndex] = {
      ...rows[additionIndex],
      type: 'movement',
      movementId,
    }
    movementCount++
  })

  return { rows, movementCount }
}

export const alignGreekVerses = (leftVerses = [], rightVerses = []) => {
  const leftTokens = tokenizeGreekVerses(leftVerses)
  const rightTokens = tokenizeGreekVerses(rightVerses)
  const matrix = createDistanceMatrix(leftTokens, rightTokens)
  const identified = identifyMovements(
    buildAlignmentRows(leftTokens, rightTokens, matrix)
  )
  const rows = identified.rows
  const summary = {
    match: 0,
    substitution: 0,
    omission: 0,
    addition: 0,
    movement: identified.movementCount,
  }

  rows.forEach((row) => {
    if (row.type !== 'movement') summary[row.type]++
  })

  return { rows, summary }
}
