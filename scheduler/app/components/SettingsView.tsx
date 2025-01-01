import React from "react";
import { SchedulerOptions } from "../types/scheduler";

interface SettingsViewProps {
  options: SchedulerOptions;
  onOptionsChange: (options: SchedulerOptions) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ options, onOptionsChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Opciones de horario</h2>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.allowOverlap}
              onChange={(e) => onOptionsChange({
                ...options,
                allowOverlap: e.target.checked
              })}
              className="rounded border-gray"
            />
            <span>Permitir superposición de horarios</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.avoidBuildingChange}
              onChange={(e) => onOptionsChange({
                ...options,
                avoidBuildingChange: e.target.checked
              })}
              className="rounded border-gray"
            />
            <span>Evitar cambios de edificio en el mismo día</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.allowFreeDay}
              onChange={(e) => onOptionsChange({
                ...options,
                allowFreeDay: e.target.checked
              })}
              className="rounded border-gray"
            />
            <span>Permitir día libre</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
