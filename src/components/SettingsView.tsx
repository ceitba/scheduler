import React from "react"
import WeeklyCalendar from "./WeeklyCalendar"
import { TimeBlock } from "../types/scheduler"

interface SettingsViewProps {
  blockedTimes: TimeBlock[]
  onChange: (blocks: TimeBlock[]) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({ blockedTimes, onChange }) => (
  <div className="rounded-card h-fit">
    <WeeklyCalendar blocks={blockedTimes} onChange={onChange} />
  </div>
)
