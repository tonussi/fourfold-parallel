import React from 'react'

export default function VerseText({ text, highlightedWord, onWordClick }) {
  if (!text) return null

  // Split text into tokens (words and non-words like spaces/punctuation)
  // This regex matches words (including accented characters) or non-word sequences
  const tokens = text.split(/([a-zA-Zà-úÀ-Ú0-9]+)/g)

  const normalize = (word) => 
    word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  const normalizedHighlighted = highlightedWord ? normalize(highlightedWord) : null

  return (
    <span className="font-serif">
      {tokens.map((token, i) => {
        const isWord = /^[a-zA-Zà-úÀ-Ú0-9]+$/.test(token)
        
        if (isWord) {
          const normalizedToken = normalize(token)
          const isHighlighted = normalizedHighlighted === normalizedToken

          return (
            <span
              key={i}
              onClick={() => onWordClick(isHighlighted ? null : token)}
              className={`
                cursor-pointer transition-all duration-200 rounded-md px-0.5 -mx-0.5
                ${isHighlighted 
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/50 dark:ring-amber-500/30 shadow-sm font-bold z-10 relative' 
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
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
