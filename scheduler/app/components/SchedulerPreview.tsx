import React from 'react';
import { PossibleSchedule } from '../types/scheduler';
import { 
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon
} from '@heroicons/react/24/outline';

interface SchedulerPreviewProps {
  schedules: PossibleSchedule[];
  onGenerateSchedules: () => void;
}

export const SchedulerPreview: React.FC<SchedulerPreviewProps> = ({ schedules, onGenerateSchedules }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {schedules.length === 0 ? (
        <div className="bg-background rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray/20">
            <h2 className="text-lg font-medium">Vista previa de horarios</h2>
          </div>
          <div className="p-4">
            {/* Empty state preview */}
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray rounded-lg">
              <div className="text-center text-gray mb-4">
                <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No hay horarios generados</p>
              </div>
              
              {/* Run Algorithm Button */}
              <button 
                onClick={onGenerateSchedules}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Generar Horarios</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-background rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray/20">
            <h2 className="text-lg font-medium">Vista previa de horarios</h2>
            <div>
              <button className="p-2 text-gray hover:bg-secondaryBackground rounded-lg">
                <ArrowLeftCircleIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray hover:bg-secondaryBackground rounded-lg">
                <ArrowRightCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            {/* TODO: Implement schedule visualization */}
            <div className="h-64 flex items-center justify-center">
              <p>Schedule visualization coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};