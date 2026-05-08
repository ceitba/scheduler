// Structural placeholder shown by the comparison view while the subject
// catalog for a given plan is still loading. Matches ScheduleGrid's
// 5-day × 14-hour shape so the layout doesn't shift when content arrives.
export default function ScheduleGridSkeleton() {
  const days = 5
  const hours = 14
  const hourHeight = 48

  // A small set of fake "course" placeholders so the loading state reads
  // as "your schedule is being prepared" rather than "the page is empty".
  const placeholders: { dayIndex: number; topMin: number; durationMin: number }[] = [
    { dayIndex: 0, topMin: 60, durationMin: 90 },
    { dayIndex: 1, topMin: 240, durationMin: 120 },
    { dayIndex: 2, topMin: 30, durationMin: 90 },
    { dayIndex: 3, topMin: 360, durationMin: 90 },
    { dayIndex: 4, topMin: 180, durationMin: 120 },
  ]

  return (
    <div className="w-full" aria-busy="true" aria-hidden="true">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5 mb-0.5">
        <div className="h-8 min-w-[50px]" />
        {Array.from({ length: days }).map((_, i) => (
          <div key={i} className="h-8 rounded-sm skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5">
        <div className="relative min-w-[50px]">
          {Array.from({ length: hours }).map((_, i) => (
            <div key={i} className="h-12 flex items-start justify-center pt-0.5">
              <div className="h-3 w-7 rounded-sm skeleton" />
            </div>
          ))}
        </div>
        {Array.from({ length: days }).map((_, dayIndex) => (
          <div key={dayIndex} className="relative" style={{ height: hours * hourHeight }}>
            {Array.from({ length: hours }).map((_, hourIndex) => (
              <div
                key={hourIndex}
                className="absolute w-full h-12 bg-surface dark:bg-[#18181b] border-b border-border/50 dark:border-[#3f3f46]/50"
                style={{ top: hourIndex * hourHeight }}
              />
            ))}
            {placeholders
              .filter((p) => p.dayIndex === dayIndex)
              .map((p, i) => (
                <div
                  key={i}
                  className="absolute w-full skeleton rounded-sm"
                  style={{
                    top: (p.topMin / 60) * hourHeight,
                    height: (p.durationMin / 60) * hourHeight,
                    zIndex: 2,
                  }}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
