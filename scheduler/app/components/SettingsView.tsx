import React, { useState, useEffect } from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import Checkbox from "./Checkbox";
import { Scheduler } from "../services/scheduler";
import { TimeBlock } from "../types/scheduler";

interface ScheduleSettings {
  allowTimeOverlap: boolean;
  avoidLocationChanges: boolean;
  haveFreeDay: boolean;
  timeFormat: '12h' | '24h';
}

export const SettingsView: React.FC = () => {
  const scheduler = Scheduler.getInstance();
  const [settings, setSettings] = useState<ScheduleSettings>({
    allowTimeOverlap: scheduler.getOptions().allowOverlap,
    avoidLocationChanges: scheduler.getOptions().avoidBuildingChange,
    haveFreeDay: scheduler.getOptions().allowFreeDay,
    timeFormat: '24h'
  });

  // Update scheduler options when settings change
  useEffect(() => {
    scheduler.setOptions({
      allowOverlap: settings.allowTimeOverlap,
      avoidBuildingChange: settings.avoidLocationChanges,
      allowFreeDay: settings.haveFreeDay
    });
  }, [settings]);

  const handleBlockedTimesChange = (blocks: TimeBlock[]) => {
    scheduler.setBlockedTimes(blocks);
    console.log('Blocked times updated:', blocks);
  };
  
  return (
    <div className="bg-background rounded-lg p-4 space-y-3">
      <h3 className="font-medium text-textDefault mb-3">Prioridades</h3>
      
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
        <Checkbox
          id="allowOverlap"
          checked={settings.allowTimeOverlap}
          onChange={(checked) => setSettings(prev => ({ ...prev, allowTimeOverlap: checked }))}
          label="Permitir superposición de horarios"
        />

        {/* <Checkbox
          id="avoidChanges"
          checked={settings.avoidLocationChanges}
          onChange={(checked) => setSettings(prev => ({ ...prev, avoidLocationChanges: checked }))}
          label="Evitar cambios de sede en un mismo día"
        /> */}

        <Checkbox
          id="freeDay"
          checked={settings.haveFreeDay}
          onChange={(checked) => setSettings(prev => ({ ...prev, haveFreeDay: checked }))}
          label="Tener un día libre"
        />
      </div>

      <WeeklyCalendar 
        onChange={handleBlockedTimesChange}
        initialBlocks={scheduler.getBlockedTimes()}
      />
    </div>
  );
};
