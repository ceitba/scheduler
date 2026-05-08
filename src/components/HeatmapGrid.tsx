import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type HeatmapModel,
  type HeatmapBucket,
  DAYS,
  GRID_START_MIN,
  GRID_END_MIN,
  BUCKET_MIN,
} from '../services/heatmap'

interface HeatmapGridProps {
  model: HeatmapModel
}

const formatMinute = (m: number): string => {
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
}

const HOUR_HEIGHT = 48
const ROWS = (GRID_END_MIN - GRID_START_MIN) / 60

const HeatmapGrid: React.FC<HeatmapGridProps> = ({ model }) => {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState<{ day: string; bucketIndex: number } | null>(null)

  const timeLabels = Array.from({ length: ROWS }, (_, i) => {
    const hour = i + GRID_START_MIN / 60
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const opacityFor = (count: number): number => {
    if (model.participantCount === 0) return 0
    const ratio = count / model.participantCount
    // Floor at 0.12 so a single-person hit is still visible; cap at 1.
    return ratio === 0 ? 0 : Math.min(1, 0.12 + ratio * 0.88)
  }

  const tooltipFor = (bucket: HeatmapBucket): string => {
    if (bucket.busyParticipants.length === 0) {
      return t('share.heatmap.noneBusy')
    }
    const names = bucket.busyParticipants.map((p) => p.displayName).join(', ')
    return t('share.heatmap.busy', {
      count: bucket.busyParticipants.length,
      total: model.participantCount,
      names,
    })
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5 mb-0.5">
        <div className="h-8 flex items-center justify-center text-xs min-w-[50px] font-mono text-ink-secondary dark:text-[#a1a1aa]">
          {t('settings.hour')}
        </div>
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center font-mono text-label text-ink-secondary dark:text-[#a1a1aa] bg-surface dark:bg-[#18181b] rounded-sm"
          >
            {t(`days.${day}`)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5">
        <div className="relative min-w-[50px]">
          {timeLabels.map((time) => (
            <div
              key={time}
              className="h-12 flex items-start justify-center font-mono text-label text-ink-secondary dark:text-[#a1a1aa] pt-0.5"
            >
              {time}
            </div>
          ))}
        </div>

        {DAYS.map((day) => {
          const buckets = model.byDay[day] ?? []
          return (
            <div key={day} className="relative" style={{ height: ROWS * HOUR_HEIGHT }}>
              {timeLabels.map((time, i) => (
                <div
                  key={time}
                  className="absolute w-full h-12 bg-surface dark:bg-[#18181b] border-b border-border/50 dark:border-[#3f3f46]/50"
                  style={{ top: i * HOUR_HEIGHT }}
                />
              ))}
              {buckets.map((bucket, bi) => {
                const top = ((bucket.fromMinute - GRID_START_MIN) / 60) * HOUR_HEIGHT
                const height = (BUCKET_MIN / 60) * HOUR_HEIGHT
                const opacity = opacityFor(bucket.busyParticipants.length)
                const isHovered = hovered?.day === day && hovered.bucketIndex === bi
                return (
                  <div
                    key={bi}
                    role="button"
                    tabIndex={0}
                    aria-label={tooltipFor(bucket)}
                    onMouseEnter={() => setHovered({ day, bucketIndex: bi })}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered({ day, bucketIndex: bi })}
                    onBlur={() => setHovered(null)}
                    className="absolute w-full transition-opacity"
                    style={{
                      top,
                      height,
                      backgroundColor: opacity > 0 ? `rgba(26, 60, 110, ${opacity})` : undefined,
                      zIndex: 2,
                      cursor: bucket.busyParticipants.length ? 'pointer' : 'default',
                    }}
                  >
                    {isHovered && bucket.busyParticipants.length > 0 && (
                      <div
                        className="absolute left-full ml-2 z-50 min-w-[12rem] max-w-[18rem] p-2 bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] rounded-card shadow-card-hover pointer-events-none"
                        style={{ top: 0 }}
                      >
                        <div className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
                          {formatMinute(bucket.fromMinute)} – {formatMinute(bucket.toMinute)} · {t(`days.${day}`)}
                        </div>
                        <div className="font-body font-semibold text-body-sm text-ink-primary dark:text-[#f4f4f5] mt-1">
                          {bucket.busyParticipants.length} / {model.participantCount}
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {bucket.busyParticipants.map((p) => (
                            <li
                              key={p.userId}
                              className="font-body text-body-sm text-ink-primary dark:text-[#f4f4f5]"
                            >
                              {p.displayName}
                              {p.sources.length > 0 && (
                                <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
                                  {' '}
                                  · {p.sources.join(', ')}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HeatmapGrid
