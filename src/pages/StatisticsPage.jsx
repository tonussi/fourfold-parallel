// StatisticsPage - Full page for word sequence statistics
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useStatisticsWorker,
  formatSequenceWithReference,
} from '../hooks/useStatisticsWorker'
import {
  GitCompare,
  Hash,
  Trophy,
  ArrowLeft,
  BookOpen,
  RefreshCw,
} from 'lucide-react'

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
        {pairs.map(([key, data]) => (
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
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {data.totalWords} {t('stats.words')}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {data.matchPercentage[Object.keys(data.matchPercentage)[0]]}% /{' '}
                {data.matchPercentage[Object.keys(data.matchPercentage)[1]]}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SequencesList({ sequences, pair, showReferences = true }) {
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
  const top = sorted.slice(0, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Trophy size={16} />
          {showReferences
            ? t('stats.common_sequences')
            : t('stats.longest_sequences')}{' '}
          ({sequences.length})
        </h4>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('stats.sort_by_length')}
        </span>
      </div>

      <div className="space-y-1.5 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {top.map((seq, idx) => {
          const formatted = formatSequenceWithReference(seq, g1, g2)
          const refs = formatted.references

          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
            >
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 min-w-[36px] text-right pt-0.5">
                {seq.length}w
              </span>

              <div className="flex-1 min-w-0">
                <p className="verse-font text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{formatted.words}"
                </p>

                {showReferences && (
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        g1 === 'matthew'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : g1 === 'mark'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : g1 === 'luke'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}
                    >
                      {refs[g1]}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">↔</span>
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        g2 === 'matthew'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : g2 === 'mark'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : g2 === 'luke'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}
                    >
                      {refs[g2]}
                    </span>
                    {formatted.similarity && (
                      <span className="ml-auto text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-800/50">
                        {formatted.similarity}% {t('stats.similar')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {sequences.length > 100 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
          {t('stats.showing_count', {
            count: 100,
            total: sequences.length,
          })}
        </p>
      )}
    </div>
  )
}

function AllGospelsCommonSequences({ stats }) {
  const { t } = useTranslation()
  const common = stats?.summary?.uniqueSequences || []

  if (common.length === 0)
    return (
      <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
        <p className="text-sm text-violet-600 dark:text-violet-400 text-center">
          {t('stats.no_common_all')}
        </p>
      </div>
    )

  const sorted = [...common].sort((a, b) => b.length - a.length)
  const top = sorted.slice(0, 50)

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2">
        <BookOpen size={16} />
        {t('stats.all_gospels_sequences')} ({common.length})
        <span className="text-xs font-normal text-violet-500 dark:text-violet-400 ml-2">
          {t('stats.q_source')}
        </span>
      </h4>

      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
        {top.map((seq, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/50"
          >
            <span className="text-xs font-bold text-violet-500 dark:text-violet-400 min-w-[36px] text-right pt-0.5">
              {seq.length}w
            </span>
            <div className="flex-1 min-w-0">
              <p className="verse-font text-sm text-violet-700 dark:text-violet-300 italic">
                "{seq.words.join(' ')}"
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
                {['matthew', 'mark', 'luke', 'john'].map((g) => (
                  <span
                    key={g}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      g === 'matthew'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : g === 'mark'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : g === 'luke'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}
                  >
                    {t(`gospels.abbrev.${g}`)}{' '}
                    {seq[`verse_${g}`] ||
                      seq[
                        `verse${g.charAt(0).toUpperCase() + g.slice(1)}`
                      ] ||
                      '?'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
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
  const { results, isLoading, error, computeSectionStats } =
    useStatisticsWorker({
      minLength,
      mode,
      deps: [currentSection, minLength, mode],
    })

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
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              {t('stats.min_words')}
            </label>
            <select
              value={minLength}
              onChange={(e) => setMinLength(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

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
                showReferences={true}
              />

              {/* All Gospels Common (Q) */}
              <AllGospelsCommonSequences stats={currentStats} />
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
  )
}

export default StatisticsPage
