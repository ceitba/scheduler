import React from "react"
import { ScheduleSlot } from "../types/scheduler"
import { Scheduler } from "../services/scheduler"

interface ScheduleGridProps {
  slots: ScheduleSlot[]
}

interface GroupedSlot {
  subject: string
  subject_id: string
  commission: string
  rooms: Array<{ classroom: string; building: string }>
  timeFrom: string
  timeTo: string
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ slots }) => {
  const scheduler = Scheduler.getInstance()
  const blockedTimes = scheduler.getBlockedTimes()

  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8
    return `${hour.toString().padStart(2, "0")}:00`
  })

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
  const dayNames = ["Lun", "Mar", "Mie", "Jue", "Vie"]

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + (minutes || 0)
  }

  const calculateSlotPosition = (timeFrom: string, timeTo: string) => {
    const startTime = timeToMinutes(timeFrom)
    const endTime = timeToMinutes(timeTo)
    const gridStart = 8 * 60
    const hourHeight = 48

    const top = ((startTime - gridStart) / 60) * hourHeight
    const height = ((endTime - startTime) / 60) * hourHeight

    return { top, height }
  }

  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = new Map<string, GroupedSlot>()
    }

    const key = `${slot.subject_id}-${slot.commission}-${slot.timeFrom}`
    const existingSlot = acc[slot.day].get(key)

    if (existingSlot) {
      existingSlot.rooms.push({
        classroom: slot.classroom,
        building: slot.building,
      })
    } else {
      acc[slot.day].set(key, {
        subject: slot.subject,
        subject_id: slot.subject_id,
        commission: slot.commission,
        timeFrom: slot.timeFrom,
        timeTo: slot.timeTo,
        rooms: [{ classroom: slot.classroom, building: slot.building }],
      })
    }

    return acc
  }, {} as Record<string, Map<string, GroupedSlot>>)

  const getSlotsForDay = (day: string): GroupedSlot[] => {
    return Array.from(slotsByDay[day]?.values() || [])
  }

  const formatRooms = (rooms: Array<{ classroom: string; building: string }>) => {
    if (rooms.length === 1) return `${rooms[0].classroom}`
    return rooms.map((r) => r.classroom).join(" | ")
  }

  const usedColors = new Map<string, string>()
  let nextColorIndex = 1

  const getSubjectColor = (subjectId: string) => {
    if (usedColors.has(subjectId)) {
      return usedColors.get(subjectId)!
    }
    const colorClass = `bg-subject_color_${nextColorIndex}`
    usedColors.set(subjectId, colorClass)
    nextColorIndex = nextColorIndex === 10 ? 1 : nextColorIndex + 1
    return colorClass
  }

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Header with days */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5 mb-0.5">
          <div className="h-8 flex items-center justify-center text-xs min-w-[50px] font-mono text-ink-secondary">
            Hora
          </div>
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center font-mono text-label text-ink-secondary bg-surface rounded-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5">
          {/* Time labels */}
          <div className="relative min-w-[50px]">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-12 flex items-start justify-center font-mono text-label text-ink-secondary pt-0.5"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const daySlots = getSlotsForDay(day)
            const overlappingGroups = new Map<string, GroupedSlot[]>()

            daySlots.forEach((slot) => {
              const slotStart = timeToMinutes(slot.timeFrom)
              const slotEnd = timeToMinutes(slot.timeTo)

              let foundGroup = false
              for (const [timeKey, group] of overlappingGroups.entries()) {
                const [groupStart, groupEnd] = timeKey.split("-").map(Number)
                if (slotStart < groupEnd && slotEnd > groupStart) {
                  group.push(slot)
                  foundGroup = true
                  break
                }
              }

              if (!foundGroup) {
                overlappingGroups.set(`${slotStart}-${slotEnd}`, [slot])
              }
            })

            return (
              <div key={day} className="relative h-[672px]">
                {/* Background grid lines */}
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="absolute w-full h-12 bg-surface border-b border-border/50"
                    style={{ top: ((timeToMinutes(time) - 8 * 60) / 60) * 48 }}
                  />
                ))}
                {/* Blocked time slots */}
                {blockedTimes
                  .filter((slot) => slot.day === day)
                  .map((block, index) => {
                    const blockStart = timeToMinutes(block.from)
                    const blockEnd = timeToMinutes(block.to)

                    const overlappingSlots = daySlots.filter((slot) => {
                      const slotStart = timeToMinutes(slot.timeFrom)
                      const slotEnd = timeToMinutes(slot.timeTo)
                      return (slotStart < blockEnd && slotEnd > blockStart)
                    })

                    const nonOverlappingRegions = []
                    let currentStart = blockStart

                    overlappingSlots.sort((a, b) => timeToMinutes(a.timeFrom) - timeToMinutes(b.timeFrom))

                    overlappingSlots.forEach(slot => {
                      const slotStart = timeToMinutes(slot.timeFrom)
                      if (currentStart < slotStart) {
                        nonOverlappingRegions.push({ start: currentStart, end: slotStart })
                      }
                      currentStart = Math.max(currentStart, timeToMinutes(slot.timeTo))
                    })

                    if (currentStart < blockEnd) {
                      nonOverlappingRegions.push({ start: currentStart, end: blockEnd })
                    }

                    const { top, height } = calculateSlotPosition(block.from, block.to)

                    const bestRegion = nonOverlappingRegions
                      .sort((a, b) => (b.end - b.start) - (a.end - a.start))[0]

                    const showLabel = bestRegion && (bestRegion.end - bestRegion.start) >= 30
                    const labelTop = ((bestRegion?.start || blockStart) - 8 * 60) / 60 * 48

                    return (
                      <div
                        key={`blocked-${block.day}-${block.from}-${index}`}
                        className="absolute w-full border-2 border-dashed border-ink-secondary/30 bg-surface/80 items-center justify-center"
                        style={{ top: `${top}px`, height: `${height}px`, zIndex: 1 }}
                      >
                        {showLabel && (
                          <div
                            className="absolute w-full flex flex-col items-center justify-center p-1"
                            style={{ top: `${labelTop - top}px`, height: '48px' }}
                          >
                            {block.label && (
                              <div className="font-body font-semibold text-ink-primary text-center break-words text-[10px] lg:text-xs pt-2">
                                {block.label}
                              </div>
                            )}
                            <div className="font-mono text-label text-ink-secondary text-center">
                              {block.from} - {block.to}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                {/* Course slots */}
                {Array.from(overlappingGroups.values()).map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {group.map((slot, slotIndex) => {
                      const { top, height } = calculateSlotPosition(slot.timeFrom, slot.timeTo)
                      const hasOverlap = group.length > 1
                      const width = hasOverlap ? `${100 / group.length}%` : "100%"
                      const left = hasOverlap ? `${(slotIndex * 100) / group.length}%` : "0"

                      return (
                        <div
                          key={`${slot.subject_id}-${slot.commission}-${slot.timeFrom}`}
                          className={`absolute p-1 ${
                            hasOverlap
                              ? "opacity-90 bg-red-100 border-2 border-dashed border-red-300"
                              : getSubjectColor(slot.subject_id)
                          }`}
                          style={{ top: `${top}px`, height: `${height}px`, width, left, zIndex: 2 }}
                        >
                          <div className="w-full h-full justify-center flex flex-col gap-0.5 text-[10px] lg:text-xs">
                            <div className="font-body font-semibold text-ink-primary text-center truncate sm:overflow-visible sm:whitespace-normal mb-1">
                              {slot.subject}
                            </div>
                            <div className="space-y-0.5 text-ink-secondary text-center text-[9px] lg:text-[11px]">
                              <div>Com. {slot.commission}</div>
                              <div>{formatRooms(slot.rooms)}</div>
                              <div>{slot.timeFrom.slice(0, 5)} - {slot.timeTo.slice(0, 5)}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ScheduleGrid
