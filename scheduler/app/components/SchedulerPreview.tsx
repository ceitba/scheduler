import React, { useState, useEffect } from 'react';
import { PossibleSchedule } from '../types/scheduler';
import ScheduleGrid from './ScheduleGrid';
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
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

  // Reset current index when schedules change
  useEffect(() => {
    setCurrentScheduleIndex(0);
  }, [schedules]);

  // Debug logs
  console.log('Schedules in preview:', schedules);
  console.log('Current schedule:', schedules[currentScheduleIndex]);

  const handlePrevSchedule = () => {
    setCurrentScheduleIndex((prev) => (prev > 0 ? prev - 1 : schedules.length - 1));
  };

  const handleNextSchedule = () => {
    setCurrentScheduleIndex((prev) => (prev < schedules.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {!schedules.length ? (
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
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium">Vista previa de horarios</h2>
              <span className="text-sm text-gray">
                Opción {currentScheduleIndex + 1} de {schedules.length}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevSchedule}
                className="p-2 text-gray hover:bg-secondaryBackground rounded-lg"
                title="Anterior horario"
              >
                <ArrowLeftCircleIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={handleNextSchedule}
                className="p-2 text-gray hover:bg-secondaryBackground rounded-lg"
                title="Siguiente horario"
              >
                <ArrowRightCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <ScheduleGrid slots={schedules[currentScheduleIndex].slots} />
          </div>
          
          {/* Schedule Info */}
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${schedules[currentScheduleIndex].hasOverlap ? 'bg-red-500' : 'bg-green-500'}`} />
                <span>{schedules[currentScheduleIndex].hasOverlap ? 'Tiene superposición' : 'Sin superposición'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${schedules[currentScheduleIndex].hasBuildingConflict ? 'bg-red-500' : 'bg-green-500'}`} />
                <span>{schedules[currentScheduleIndex].hasBuildingConflict ? 'Conflicto de edificios' : 'Sin conflicto de edificios'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${schedules[currentScheduleIndex].hasFreeDay ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span>{schedules[currentScheduleIndex].hasFreeDay ? 'Tiene día libre' : 'Sin día libre'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};