import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlignHorizontalSpaceAround } from 'lucide-react'
import { alignGreekVerses } from '@src/utils/greekTextAnalysis'

const EMPTY_VERSES_BY_GOSPEL = {}
const EMPTY_VERSES = []
const ALIGNMENT_TYPES = [
  'match',
  'substitution',
  'omission',
  'addition',
  'movement',
]

const TYPE_STYLES = {
  match: {
    row: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    token: 'text-emerald-800 dark:text-emerald-200',
    symbol: '=',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  substitution: {
    row: 'bg-amber-50/70 dark:bg-amber-950/20',
    token: 'text-amber-900 dark:text-amber-100',
    symbol: '↔',
    badge:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  omission: {
    row: 'bg-rose-50/70 dark:bg-rose-950/20',
    token: 'text-rose-800 dark:text-rose-200',
    symbol: '−',
    badge:
      'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
  addition: {
    row: 'bg-sky-50/70 dark:bg-sky-950/20',
    token: 'text-sky-800 dark:text-sky-200',
    symbol: '+',
    badge:
      'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  movement: {
    row: 'bg-violet-50/70 dark:bg-violet-950/20',
    token: 'text-violet-800 dark:text-violet-200',
    symbol: '↕',
    badge:
      'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
}

function AlignmentToken({ token, type }) {
  if (!token) {
    return <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">—</span>
  }

  return (
    <span className={`verse-font ${TYPE_STYLES[type].token}`}>
      <sup className="mr-1 text-[9px] font-bold opacity-60">{token.verse}</sup>
      {token.text}
    </span>
  )
}

export default function AlignedTextComparison({
  pair,
  versesByGospel = EMPTY_VERSES_BY_GOSPEL,
}) {
  const { t } = useTranslation()
  const [leftGospel, rightGospel] = pair.split('-')
  const leftVerses = versesByGospel[leftGospel] || EMPTY_VERSES
  const rightVerses = versesByGospel[rightGospel] || EMPTY_VERSES
  const alignment = useMemo(
    () => alignGreekVerses(leftVerses, rightVerses),
    [leftVerses, rightVerses]
  )

  if (leftVerses.length === 0 || rightVerses.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <AlignHorizontalSpaceAround size={16} />
          {t('stats.aligned_comparison')}
        </h4>
        <p role="status" className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('stats.alignment_unavailable')}
        </p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <AlignHorizontalSpaceAround size={16} />
              {t('stats.aligned_comparison')}
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('stats.aligned_comparison_description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label={t('stats.alignment_legend')}>
            {ALIGNMENT_TYPES.map((type) => (
              <span
                key={type}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${TYPE_STYLES[type].badge}`}
              >
                {t(`stats.alignment_types.${type}`)} {alignment.summary[type]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
        <span>{t(`gospels.${leftGospel}`)}</span>
        <span className="text-center" aria-hidden="true">×</span>
        <span className="text-right">{t(`gospels.${rightGospel}`)}</span>
      </div>

      <div className="max-h-[32rem] overflow-y-auto overscroll-contain">
        {alignment.rows.map((row, index) => (
          <div
            key={`${index}-${row.left?.text || ''}-${row.right?.text || ''}`}
            data-alignment-type={row.type}
            className={`grid min-h-10 grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center border-b border-white/60 px-3 py-2 text-sm last:border-b-0 dark:border-slate-900/70 ${TYPE_STYLES[row.type].row} [content-visibility:auto]`}
          >
            <span className="min-w-0 break-words text-left">
              <AlignmentToken token={row.left} type={row.type} />
            </span>
            <span
              className="text-center text-xs font-black text-slate-400 dark:text-slate-500"
              title={t(`stats.alignment_types.${row.type}`)}
            >
              {TYPE_STYLES[row.type].symbol}
            </span>
            <span className="min-w-0 break-words text-right">
              <AlignmentToken token={row.right} type={row.type} />
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
