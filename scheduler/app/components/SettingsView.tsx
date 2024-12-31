import React, { useState } from "react";
import WeeklyCalendar from "./WeeklyCalendar";

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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.allowTimeOverlap}
            onChange={(e) => setSettings(prev => ({ ...prev, allowTimeOverlap: e.target.checked }))}
            className="w-4 h-4 text-primary accent-primary cursor-pointer"
          />
          <label className="text-sm text-textDefault cursor-pointer">
            Permitir superposición de horarios
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.avoidLocationChanges}
            onChange={(e) => setSettings(prev => ({ ...prev, avoidLocationChanges: e.target.checked }))}
            className="w-4 h-4 text-primary accent-primary cursor-pointer"
          />
          <label className="text-sm text-textDefault cursor-pointer">
            Evitar cambios de sede en un mismo día
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.haveFreeDay}
            onChange={(e) => setSettings(prev => ({ ...prev, haveFreeDay: e.target.checked }))}
            className="w-4 h-4 text-primary accent-primary cursor-pointer"
          />
          <label className="text-sm text-textDefault cursor-pointer">
            Tener un día libre
          </label>
        </div>

        {/* <div className="flex items-center gap-2">
          <select
            value={settings.timeFormat}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              timeFormat: e.target.value as '12h' | '24h' 
            }))}
            className="text-sm border border-gray/20 rounded px-2 py-1 bg-background text-textDefault"
          >
            <option value="24h">Formato 24hs</option>
            <option value="12h">Formato 12hs</option>
          </select>
        </div> */}
      </div>

  <WeeklyCalendar 
    onChange={(blocks) => console.log('Blocked times:', blocks)} 
  />
    </div>
  );
};

export default SettingsView;
