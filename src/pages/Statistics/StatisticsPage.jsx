// StatisticsPage - Full page for word sequence statistics
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useStatisticsWorker,
  formatSequenceWithReference,
} from '../../hooks/useStatisticsWorker'
import {
  GitCompare,
  Hash,
  Trophy,
  ArrowLeft,
  BookOpen,
  RefreshCw,
  ChevronDown,
  Languages,
  ArrowRight,
} from 'lucide-react'
import { BibleVersionEnum, fetchVerses } from '../../verses'
import api from '../../services/api'

function StatCard({ icon: Icon, label, value, subValue, color = 'indigo' }) {
  const colorClasses = {
    indigo:
      'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald:
      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber:
      'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    violet:
      'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {label}
        </p>
        <p className="font-bold text-slate-900 dark:text-white text-xl">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {subValue}
          </p>
        )}
      </div>
    </div>
  )
}

function PairComparison({ stats, selectedPair, onSelectPair }) {
  const { t } = useTranslation()
  if (!stats?.pairs) return null

  const pairs = Object.entries(stats.pairs)

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <GitCompare size={16} />
        {t('stats.gospel_comparisons')}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pairs.map(([key, data]) => {
          const [g1, g2] = key.split('-')
          const g1Words = stats.totalWords?.[g1] || 0
          const g2Words = stats.totalWords?.[g2] || 0
          return (
            <button
              key={key}
              onClick={() => onSelectPair(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPair === key
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(`gospels.pairs.${key}`)}
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {data.count}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                {t(`gospels.${g1}`)}: {g1Words}w • {t(`gospels.${g2}`)}:{' '}
                {g2Words}w
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {data.totalWords} {t('stats.words')}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {data.matchPercentage}%
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SequencesList({
  sequences,
  pair,
  translationVerses = {},
  comparedVerses = {},
  translationVersion,
}) {
  const { t } = useTranslation()
  if (!sequences || sequences.length === 0)
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Hash size={32} className="mx-auto mb-2 opacity-50" />
        <p>{t('stats.no_sequences_found')}</p>
      </div>
    )

  const [g1, g2] = pair.split('-')
  const sorted = [...sequences].sort((a, b) => b.length - a.length)
  const top = sorted.slice(0, 50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Trophy size={16} />
          {t('stats.common_sequences')} ({sequences.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {top.map((seq, idx) => {
          const formatted = formatSequenceWithReference(seq, g1, g2)

          // Look up full texts
          const text1 =
            comparedVerses[g1]?.find((v) => v.verse === seq.verse1)
              ?.scripture || ''
          const text2 =
            comparedVerses[g2]?.find((v) => v.verse === seq.verse2)
              ?.scripture || ''
          const trans =
            translationVerses[g1]?.find((v) => v.verse === seq.verse1)
              ?.scripture || ''

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-500 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                  {seq.length}w
                </span>
                <p className="verse-font text-sm font-medium text-slate-600 dark:text-slate-400 italic">
                  "{formatted.words}"
                </p>
                {seq.similarity && (
                  <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                    {seq.similarity}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column 1: Side A */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t(`gospels.${g1}`)} {formatted.references[g1]}
                  </span>
                  <p className="verse-font text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {text1}
                  </p>
                </div>

                {/* Column 2: Side B */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t(`gospels.${g2}`)} {formatted.references[g2]}
                  </span>
                  <p className="verse-font text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {text2}
                  </p>
                </div>

                {/* Column 3: Translation */}
                <div className="space-y-2 border-l border-slate-100 dark:border-slate-800 pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    {translationVersion || t('stats.translation')}
                  </span>
                  <p className="verse-font text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
                    {trans || '—'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatisticsPage({ currentSection, selectedVersion, onBack }) {
  const { t } = useTranslation()
  const [minLength, setMinLength] = useState(3)
  const [mode, setMode] = useState('exact')
  const [selectedPair, setSelectedPair] = useState('matthew-luke')

  // Compute statistics when section, minLength or mode changes
  const [translationVerses, setTranslationVerses] = useState({})
  const [comparedVerses, setComparedVerses] = useState({})

  // Compute statistics when section, minLength or mode changes
  const {
    results,
    isLoading,
    error,
    computeSectionStats,
    setTranslationVersion,
    translationVersion,
  } = useStatisticsWorker({
    minLength,
    mode,
    translationVersion: 'ACF', // Default translation
    deps: [currentSection, minLength, mode],
  })

  // Fetch translation verses and compared verses on-demand
  useEffect(() => {
    if (!currentSection) return

    // Organize compared verses from currentSection
    const compared = {}
    currentSection.passages?.forEach((p) => {
      compared[p.gospel] = p.verses || []
    })
    setComparedVerses(compared)

    // Fetch translation verses if version is selected
    if (translationVersion) {
      const querySegments = currentSection.passages
        ?.map((p) => {
          // Reconstruct segment from passage reference
          // Handle "Matthew 1:1" or "Matthew 1:1-8" or "1 John 1:1"
          const match = p.reference.match(
            /^(\d?\s?[\w\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/
          )
          if (match) {
            const book = match[1].trim()
            const chapter = parseInt(match[2])
            const from = parseInt(match[3])
            const to = match[4] ? parseInt(match[4]) : from

            return {
              book,
              chapter,
              from,
              to,
              publisher: translationVersion,
            }
          }
          return null
        })
        .filter(Boolean)

      if (querySegments?.length > 0) {
        fetchVerses(querySegments, translationVersion)
          .then((data) => {
            // Find the key that isn't jobId or status
            const label = Object.keys(data).find(
              (k) => k !== 'jobId' && k !== 'status' && !k.startsWith('_')
            )
            if (label && Array.isArray(data[label])) {
              const bookMap = {
                40: 'matthew',
                41: 'mark',
                42: 'luke',
                43: 'john',
              }
              const mapped = {}
              data[label].forEach((v) => {
                const g = bookMap[v.book]
                if (g) {
                  if (!mapped[g]) mapped[g] = []
                  mapped[g].push(v)
                }
              })
              setTranslationVerses(mapped)
            }
          })
          .catch((err) => console.error('Failed to fetch translation:', err))
      }
    } else {
      setTranslationVerses({})
    }
  }, [currentSection, translationVersion])

  useEffect(() => {
    if (currentSection) {
      computeSectionStats(currentSection)
    }
  }, [currentSection, minLength, mode, computeSectionStats])

  const currentStats = results
  const pairSequences = currentStats?.pairs?.[selectedPair]?.sequences || []

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft
                size={20}
                className="text-slate-600 dark:text-slate-400"
              />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('stats.title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentSection?.title || t('common.loading')} •{' '}
                {selectedVersion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-xs text-indigo-500 animate-pulse flex items-center gap-1">
                <RefreshCw size={14} className="animate-spin" />
                {t('stats.calculating')}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 pb-3 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setMode('exact')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'exact'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t('stats.exact')}
            </button>
            <button
              onClick={() => setMode('relaxed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'relaxed'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t('stats.relaxed')}
            </button>
            <div className="flex items-center gap-2 ml-4 border-l border-slate-200 dark:border-slate-700 pl-4">
              <label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Languages size={14} className="text-indigo-500" />
                {t('stats.translation')}
              </label>
              <select
                value={translationVersion || ''}
                onChange={(e) => setTranslationVersion(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None</option>
                {Object.keys(BibleVersionEnum).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
                {t('common.error')}: {error}
              </div>
            )}

            {currentStats && !isLoading && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    icon={GitCompare}
                    label={t('stats.total_pairs')}
                    value={
                      currentStats.summary
                        ? Object.keys(currentStats.pairs || {}).length
                        : 0
                    }
                    color="indigo"
                  />
                  <StatCard
                    icon={Hash}
                    label={t('stats.total_sequences')}
                    value={Object.values(currentStats.pairs || {}).reduce(
                      (sum, p) => sum + p.count,
                      0
                    )}
                    color="emerald"
                  />
                  <StatCard
                    icon={Trophy}
                    label={t('stats.words_in_q')}
                    value={currentStats.summary?.totalMatchingWords || 0}
                    subValue={t('stats.showing_count', {
                      count: currentStats.summary?.totalMatches || 0,
                      total: currentStats.summary?.totalMatches || 0,
                    }).replace('Showing ', '')}
                    color="violet"
                  />
                  <StatCard
                    icon={BookOpen}
                    label={t('stats.active_verses')}
                    value={Object.values(currentStats.totalWords || {}).reduce(
                      (a, b) => a + b,
                      0
                    )}
                    color="amber"
                  />
                </div>

                {/* Pair Comparisons */}
                <PairComparison
                  stats={currentStats}
                  selectedPair={selectedPair}
                  onSelectPair={setSelectedPair}
                />

                {/* Selected Pair Sequences */}
                <SequencesList
                  sequences={pairSequences}
                  pair={selectedPair}
                  comparedVerses={comparedVerses}
                  translationVerses={translationVerses}
                  translationVersion={translationVersion}
                />
              </>
            )}

            {isLoading && !currentStats && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <RefreshCw
                    size={32}
                    className="animate-spin text-indigo-500 mx-auto mb-3"
                  />
                  <p className="text-slate-500 dark:text-slate-400">
                    {t('stats.loading_stats')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatisticsPage
