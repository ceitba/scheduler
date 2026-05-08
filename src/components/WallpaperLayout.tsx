import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ScheduleSlot } from '../types/scheduler'

interface WallpaperLayoutProps {
  slots: ScheduleSlot[]
  title?: string
  subtitle?: string
}

interface DayBlock {
  subject: string
  subject_id: string
  commission: string
  classroom: string
  building: string
  timeFrom: string
  timeTo: string
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

const timeKey = (s: ScheduleSlot) => `${s.day}|${s.subject_id}|${s.commission}|${s.timeFrom}`

// 9:16 (1080x1920) layout for phone wallpapers. Days stack vertically,
// each course renders as a typographic card. The WHOLE component is sized
// at full target dimensions so html2canvas captures it 1:1 — callers
// position the wrapper offscreen.
const WallpaperLayout = forwardRef<HTMLDivElement, WallpaperLayoutProps>(
  ({ slots, title, subtitle }, ref) => {
    const { t } = useTranslation()

    const byDay: Record<string, DayBlock[]> = {}
    const dedup = new Map<string, DayBlock>()
    for (const s of slots) {
      const k = timeKey(s)
      if (dedup.has(k)) continue
      const block: DayBlock = {
        subject: s.subject,
        subject_id: s.subject_id,
        commission: s.commission,
        classroom: s.classroom,
        building: s.building,
        timeFrom: s.timeFrom.slice(0, 5),
        timeTo: s.timeTo.slice(0, 5),
      }
      dedup.set(k, block)
      ;(byDay[s.day] ||= []).push(block)
    }
    Object.values(byDay).forEach((arr) => arr.sort((a, b) => a.timeFrom.localeCompare(b.timeFrom)))

    // Density-aware scale. Sized for a typical 2-3 courses/day case so the
    // wallpaper actually reads at arm's length on a phone lock screen — the
    // earlier conservative sizes left ~30% of vertical space empty. Tier
    // only kicks in for genuinely-busy days (5+ courses) so the rare edge
    // case still fits inside 1920px.
    const maxPerDay = Math.max(0, ...DAYS.map((d) => (byDay[d] ?? []).length))
    const dense = maxPerDay >= 5
    const subjectFont = dense ? 26 : 36
    const timeFont = dense ? 24 : 30
    const metaFont = dense ? 14 : 17
    const dayLabelFont = dense ? 36 : 44
    const courseGap = dense ? 8 : 14
    const sectionGap = dense ? 14 : 18
    const sectionPadTop = dense ? 12 : 16
    const timeCol = dense ? 170 : 200
    const timeGap = dense ? 22 : 28

    return (
      <div
        ref={ref}
        // Inline styles only — html2canvas captures computed styles, but
        // pinning the values here avoids any cascade surprises across themes.
        // overflow:hidden + flex-column with footer:marginTop:auto pins
        // header to top, footer to bottom; days flow naturally between them.
        // No flex:1 with minHeight:0 (that earlier strategy caused sections
        // to compress and content to overlap when courses got dense).
        style={{
          width: '1080px',
          height: '1920px',
          padding: '64px 56px',
          backgroundColor: '#FAFAF8',
          color: '#1C1C1E',
          fontFamily: '"Source Sans 3", system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '32px' }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '20px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#6B7280',
          }}>
            CEITBA · {t('nav.scheduler')}
          </span>
          <h1 style={{
            fontFamily: '"Fraunces", serif',
            fontSize: '84px',
            fontWeight: 800,
            lineHeight: 1.05,
            margin: 0,
            color: '#1A3C6E',
            letterSpacing: '-0.02em',
          }}>
            {title ?? t('wallpaper.defaultTitle')}
          </h1>
          {subtitle && (
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '21px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginTop: '6px',
            }}>
              {subtitle}
            </span>
          )}
        </header>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${sectionGap}px`,
        }}>
          {DAYS.map((day) => {
            const dayBlocks = byDay[day] ?? []
            return (
              <section
                key={day}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  gap: '28px',
                  alignItems: 'start',
                  paddingTop: `${sectionPadTop}px`,
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{
                    fontFamily: '"Fraunces", serif',
                    fontSize: `${dayLabelFont}px`,
                    fontWeight: 700,
                    color: '#1A3C6E',
                    lineHeight: 1.05,
                  }}>
                    {t(`days.${day}`).toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '14px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#6B7280',
                  }}>
                    {dayBlocks.length === 0
                      ? t('wallpaper.freeDay')
                      : t('wallpaper.classCount', { count: dayBlocks.length })}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: `${courseGap}px` }}>
                  {dayBlocks.map((b, i) => (
                    <article
                      key={i}
                      // Wider time column + bigger gap so 30px mono
                      // "08:00–10:00" can't bleed into the subject — the
                      // earlier 140/18 sizing was just barely tight enough
                      // to look like the gap had collapsed.
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `${timeCol}px 1fr`,
                        gap: `${timeGap}px`,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: `${timeFont}px`,
                        fontWeight: 600,
                        color: '#1A3C6E',
                        whiteSpace: 'nowrap',
                        // Optical alignment: nudge the mono baseline down so
                        // it sits on the Fraunces cap line rather than above it.
                        paddingTop: '4px',
                      }}>
                        {b.timeFrom}–{b.timeTo}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                        <span style={{
                          fontFamily: '"Fraunces", serif',
                          fontSize: `${subjectFont}px`,
                          fontWeight: 700,
                          color: '#1C1C1E',
                          // Generous line-height keeps descenders from being
                          // clipped under html2canvas's font-fallback metrics.
                          // No overflow:hidden — without whiteSpace:nowrap it
                          // doesn't ellipsis, it just clips wrapped lines.
                          lineHeight: 1.25,
                          wordWrap: 'break-word',
                        }}>
                          {b.subject}
                        </span>
                        <span style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: `${metaFont}px`,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#6B7280',
                          lineHeight: 1.4,
                        }}>
                          {b.subject_id} · {t('commission.commission')} {b.commission}
                          {b.classroom && ` · ${b.classroom}`}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <footer style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '13px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9CA3AF',
          textAlign: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #E5E7EB',
          marginTop: 'auto',
        }}>
          ceitba.org.ar · {new Date().toLocaleDateString()}
        </footer>
      </div>
    )
  },
)

WallpaperLayout.displayName = 'WallpaperLayout'

export default WallpaperLayout
