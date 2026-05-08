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

    return (
      <div
        ref={ref}
        // Inline styles only — html2canvas captures computed styles, but
        // pinning the values here avoids any cascade surprises across themes.
        style={{
          width: '1080px',
          height: '1920px',
          padding: '80px 64px',
          backgroundColor: '#FAFAF8',
          color: '#1C1C1E',
          fontFamily: '"Source Sans 3", system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
          boxSizing: 'border-box',
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
            fontSize: '88px',
            fontWeight: 800,
            lineHeight: 1.0,
            margin: 0,
            color: '#1A3C6E',
            letterSpacing: '-0.02em',
          }}>
            {title ?? t('wallpaper.defaultTitle')}
          </h1>
          {subtitle && (
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '22px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginTop: '4px',
            }}>
              {subtitle}
            </span>
          )}
        </header>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minHeight: 0,
        }}>
          {DAYS.map((day) => {
            const dayBlocks = byDay[day] ?? []
            return (
              <section
                key={day}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  gap: '24px',
                  alignItems: 'start',
                  paddingTop: '14px',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{
                    fontFamily: '"Fraunces", serif',
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#1A3C6E',
                    lineHeight: 1.0,
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dayBlocks.map((b, i) => (
                    <article
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '170px 1fr',
                        gap: '20px',
                        alignItems: 'baseline',
                      }}
                    >
                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '26px',
                        fontWeight: 600,
                        color: '#1A3C6E',
                        whiteSpace: 'nowrap',
                      }}>
                        {b.timeFrom}–{b.timeTo}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <span style={{
                          fontFamily: '"Fraunces", serif',
                          fontSize: '28px',
                          fontWeight: 700,
                          color: '#1C1C1E',
                          lineHeight: 1.15,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {b.subject}
                        </span>
                        <span style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '16px',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#6B7280',
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
          fontSize: '14px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9CA3AF',
          textAlign: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #E5E7EB',
        }}>
          ceitba.org.ar · {new Date().toLocaleDateString()}
        </footer>
      </div>
    )
  },
)

WallpaperLayout.displayName = 'WallpaperLayout'

export default WallpaperLayout
