import React from 'react'

const TOKEN_PATTERN = /([\p{L}\p{M}\p{N}]+)/gu
const WORD_PATTERN = /^[\p{L}\p{M}\p{N}]+$/u
const DIACRITIC_PATTERN = /\p{M}/gu

const normalizeWord = (word) =>
  word
    .normalize('NFD')
    .replace(DIACRITIC_PATTERN, '')
    .toLocaleLowerCase()

export default function VerseText({ text, highlightedWord, onWordClick }) {
  if (!text) return null

  const tokens = text.split(TOKEN_PATTERN)
  const normalizedHighlighted = highlightedWord
    ? normalizeWord(highlightedWord)
    : null

  return (
    <span className="verse-font">
      {tokens.map((token, i) => {
        const isWord = WORD_PATTERN.test(token)

        if (isWord) {
          const normalizedToken = normalizeWord(token)
          const isHighlighted = normalizedHighlighted === normalizedToken
          const toggleWord = () => onWordClick(isHighlighted ? null : token)
          const handleKeyDown = (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return

            event.preventDefault()
            toggleWord()
          }

          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              aria-pressed={isHighlighted}
              onClick={toggleWord}
              onKeyDown={handleKeyDown}
              className={`
                relative inline cursor-pointer touch-manipulation rounded-[0.2em]
                outline-none transition-[color,background-color,box-shadow] duration-150
                focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1
                dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-slate-950
                ${
                  isHighlighted
                    ? 'z-10 bg-amber-200/90 text-amber-950 ring-1 ring-inset ring-amber-500/70 shadow-sm font-semibold dark:bg-amber-400/25 dark:text-amber-100 dark:ring-amber-400/60'
                    : 'hover:bg-amber-100/80 active:bg-amber-200/90 dark:hover:bg-amber-400/15 dark:active:bg-amber-400/25'
                }
              `}
            >
              {token}
            </span>
          )
        }

        return <React.Fragment key={i}>{token}</React.Fragment>
      })}
    </span>
  )
}
