import GospelColumn from '@src/components/GospelColumn'
import MobileGospelTabs from '@src/components/MobileGospelTabs'
import { GOSPELS } from '@src/utils/bibleHelpers'

export default function ReaderSection({
  isMobile,
  activeGospelTab,
  gospelConfig,
  onTabChange,
  onSwipe,
  currentSection,
  getPassageForGospel,
  highlightedWord,
  onWordClick,
  loading,
}) {
  if (isMobile) {
    return (
      <MobileGospelTabs
        gospels={GOSPELS}
        gospelConfig={gospelConfig}
        activeTab={activeGospelTab}
        onTabChange={onTabChange}
        onSwipe={onSwipe}
        currentSection={currentSection}
        getPassageForGospel={getPassageForGospel}
        highlightedWord={highlightedWord}
        onWordClick={onWordClick}
        loading={loading}
      />
    )
  }

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-hidden">
      <div className="max-w-[1920px] mx-auto h-full">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-fr h-full">
          {GOSPELS.map((gospel) => {
            const passage = getPassageForGospel(gospel)
            return (
              <GospelColumn
                key={gospel}
                gospel={gospel}
                reference={passage.reference}
                verses={passage.verses}
                highlightedWord={highlightedWord}
                onWordClick={onWordClick}
                loading={loading}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
