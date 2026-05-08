import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type HeatmapModel,
  type ParticipantBlock,
  DAYS,
  GRID_START_MIN,
  GRID_END_MIN,
} from '../services/heatmap'

interface HeatmapGridProps {
  model: HeatmapModel
}

const HOUR_HEIGHT = 48
const ROWS = (GRID_END_MIN - GRID_START_MIN) / 60

const formatMinute = (m: number): string => {
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
}

interface PlacedBlock extends ParticipantBlock {
  columnIndex: number
  columnsInCluster: number
}

// Cluster-aware column allocation — same idea calendar UIs use. Blocks that
// transitively overlap share a cluster; within a cluster, each block gets a
// column based on greedy leftmost placement so columns don't waste space.
// Clusters are independent (no shared columns), so a busy 9-11 chunk doesn't
// thin out the rest of the day's blocks.
const layoutDay = (blocks: ParticipantBlock[]): PlacedBlock[] => {
  if (blocks.length === 0) return []
  const sorted = [...blocks].sort((a, b) => a.fromMinute - b.fromMinute || a.toMinute - b.toMinute)

  type Cluster = { from: number; to: number; columns: ParticipantBlock[][] }
  const clusters: Cluster[] = []

  for (const block of sorted) {
    let cluster = clusters[clusters.length - 1]
    // New cluster if this block doesn't overlap the running one.
    if (!cluster || block.fromMinute >= cluster.to) {
      cluster = { from: block.fromMinute, to: block.toMinute, columns: [] }
      clusters.push(cluster)
    } else {
      cluster.to = Math.max(cluster.to, block.toMinute)
    }
    // Place in leftmost column whose last entry ends at or before this block's start.
    let placed = false
    for (const col of cluster.columns) {
      const last = col[col.length - 1]
      if (last.toMinute <= block.fromMinute) {
        col.push(block)
        placed = true
        break
      }
    }
    if (!placed) cluster.columns.push([block])
  }

  const placed: PlacedBlock[] = []
  for (const c of clusters) {
    for (let ci = 0; ci < c.columns.length; ci++) {
      for (const b of c.columns[ci]) {
        placed.push({ ...b, columnIndex: ci, columnsInCluster: c.columns.length })
      }
    }
  }
  return placed
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({ model }) => {
  const { t } = useTranslation()
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null)

  const timeLabels = Array.from({ length: ROWS }, (_, i) => {
    const hour = i + GRID_START_MIN / 60
    return `${hour.toString().padStart(2, '0')}:00`
  })

  // userId → displayName lookup so the hover tooltip can name everyone
  // overlapping this block, not just the block's own owner.
  const namesByUserId = useMemo(() => {
    const map = new Map<string, string>()
    for (const day of DAYS) {
      for (const b of model.byDay[day] ?? []) map.set(b.userId, b.displayName)
    }
    return map
  }, [model])

  const opacityFor = (overlap: number) => {
    if (model.participantCount === 0) return 0.2
    const ratio = overlap / model.participantCount
    return Math.min(1, 0.18 + ratio * 0.7)
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
          const placed = layoutDay(model.byDay[day] ?? [])
          return (
            <div key={day} className="relative" style={{ height: ROWS * HOUR_HEIGHT }}>
              {timeLabels.map((time, i) => (
                <div
                  key={time}
                  className="absolute w-full h-12 bg-surface dark:bg-[#18181b] border-b border-border/50 dark:border-[#3f3f46]/50"
                  style={{ top: i * HOUR_HEIGHT }}
                />
              ))}
              {placed.map((b) => {
                const top = ((b.fromMinute - GRID_START_MIN) / 60) * HOUR_HEIGHT
                const height = ((b.toMinute - b.fromMinute) / 60) * HOUR_HEIGHT
                const widthPct = 100 / b.columnsInCluster
                const leftPct = b.columnIndex * widthPct
                const overlapCount = b.overlapUserIds.length
                const opacity = opacityFor(overlapCount)
                const isHovered = hoveredBlockId === b.blockId
                const isNarrow = b.columnsInCluster >= 3 || height < 36
                return (
                  <div
                    key={b.blockId}
                    role="button"
                    tabIndex={0}
                    aria-label={`${b.displayName} · ${b.source} · ${overlapCount}/${model.participantCount}`}
                    onMouseEnter={() => setHoveredBlockId(b.blockId)}
                    onMouseLeave={() => setHoveredBlockId(null)}
                    onFocus={() => setHoveredBlockId(b.blockId)}
                    onBlur={() => setHoveredBlockId(null)}
                    className="absolute overflow-hidden border border-white/30 dark:border-black/30 rounded-sm"
                    style={{
                      top,
                      height,
                      width: `calc(${widthPct}% - 2px)`,
                      left: `calc(${leftPct}% + 1px)`,
                      backgroundColor: `rgba(26, 60, 110, ${opacity})`,
                      zIndex: 2,
                      cursor: 'pointer',
                      color: opacity > 0.55 ? '#FAFAF8' : '#1C1C1E',
                    }}
                  >
                    {/* Always-visible X/Z badge in the top-right corner. */}
                    <span
                      className="absolute top-0.5 right-0.5 px-1 rounded-sm font-mono text-[10px] leading-tight"
                      style={{
                        backgroundColor: opacity > 0.55 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                        color: opacity > 0.55 ? '#FAFAF8' : '#1A3C6E',
                      }}
                    >
                      {overlapCount}/{model.participantCount}
                    </span>
                    {!isNarrow && (
                      <div className="p-1 pr-8 flex flex-col gap-0.5 text-[10px] lg:text-[11px] leading-tight">
                        <div className="font-body font-semibold truncate">{b.displayName}</div>
                        <div className="font-mono opacity-80 truncate">{b.source}</div>
                      </div>
                    )}
                    {isHovered && (
                      <div
                        className="absolute left-full ml-2 z-50 min-w-[12rem] max-w-[18rem] p-2 bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] rounded-card shadow-card-hover pointer-events-none"
                        style={{ top: 0, color: '#1C1C1E' }}
                      >
                        <div className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
                          {formatMinute(b.fromMinute)} – {formatMinute(b.toMinute)} · {t(`days.${day}`)}
                        </div>
                        <div className="font-body font-semibold text-body-sm text-ink-primary dark:text-[#f4f4f5] mt-1">
                          {overlapCount} / {model.participantCount}
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {b.overlapUserIds.map((uid) => (
                            <li
                              key={uid}
                              className="font-body text-body-sm text-ink-primary dark:text-[#f4f4f5]"
                            >
                              {namesByUserId.get(uid) ?? uid}
                              {uid === b.userId && (
                                <span className="font-mono text-label text-primary ml-1">
                                  · {b.source}
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
