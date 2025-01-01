import React, { useState } from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import Checkbox from "./Checkbox";

interface ScheduleSettings {
  allowTimeOverlap: boolean;
  avoidLocationChanges: boolean;
  haveFreeDay: boolean;
  timeFormat: '12h' | '24h';
}

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<ScheduleSettings>({
    allowTimeOverlap: false,
    avoidLocationChanges: false,
    haveFreeDay: false,
    timeFormat: '24h'
  });
  
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

        <Checkbox
          id="avoidChanges"
          checked={settings.avoidLocationChanges}
          onChange={(checked) => setSettings(prev => ({ ...prev, avoidLocationChanges: checked }))}
          label="Evitar cambios de sede en un mismo día"
        />

        <Checkbox
          id="freeDay"
          checked={settings.haveFreeDay}
          onChange={(checked) => setSettings(prev => ({ ...prev, haveFreeDay: checked }))}
          label="Tener un día libre"
        />
      </div>

      <WeeklyCalendar 
        onChange={(blocks) => console.log('Blocked times:', blocks)} 
      />
    </div>
  );
};

export default SettingsView;
