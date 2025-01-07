import React from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import { Scheduler } from "../services/scheduler";
import { TimeBlock } from "../types/scheduler";

export const SettingsView: React.FC = () => {
  const scheduler = Scheduler.getInstance();

  const handleBlockedTimesChange = (blocks: TimeBlock[]) => {
    scheduler.setBlockedTimes(blocks);
    console.log('Blocked times updated:', blocks);
  };
  
  return (
    <div className="bg-background rounded-lg h-fit">
      <WeeklyCalendar 
        onChange={handleBlockedTimesChange}
        initialBlocks={scheduler.getBlockedTimes().map(block => ({
          ...block,
          id: crypto.randomUUID()
        }))}
      />
    </div>
  );
};
