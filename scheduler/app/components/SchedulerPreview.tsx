import React, { useState } from 'react';

interface Cell {
  day: number;
  hour: number;
}

interface Range {
  start: Cell;
  end: Cell;
}

const SchedulerPreview: React.FC = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [endCell, setEndCell] = useState<Cell | null>(null);
  const [selectedRanges, setSelectedRanges] = useState<Range[]>([]);
  const [modifyingRangeIndex, setModifyingRangeIndex] = useState<number | null>(null);

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 to 21:00

  const handleMouseDown = (day: number, hour: number) => {
    const cell = { day, hour };
    
    // Check if clicking on an existing range
    const existingRangeIndex = selectedRanges.findIndex(range => 
      isCellInRange(day, hour, range)
    );

    if (existingRangeIndex !== -1) {
      // Start modifying existing range
      setModifyingRangeIndex(existingRangeIndex);
      const range = selectedRanges[existingRangeIndex];
      setStartCell(range.start);
      setEndCell(cell); // Use clicked cell as new end point
    } else {
      // Start new selection
      setStartCell(cell);
      setEndCell(cell);
      setModifyingRangeIndex(null);
    }
    setIsSelecting(true);
  };

  const handleMouseEnter = (day: number, hour: number) => {
    if (isSelecting && startCell) {
      setEndCell({ day, hour });
    }
  };

  const handleMouseUp = () => {
    if (startCell && endCell) {
      const newRange = {
        start: {
          day: Math.min(startCell.day, endCell.day),
          hour: Math.min(startCell.hour, endCell.hour)
        },
        end: {
          day: Math.max(startCell.day, endCell.day),
          hour: Math.max(startCell.hour, endCell.hour)
        }
      };

      if (modifyingRangeIndex !== null) {
        // Update existing range
        const updatedRanges = [...selectedRanges];
        if (isZeroSizeRange(newRange)) {
          // Remove the range if it's been shrunk to nothing
          updatedRanges.splice(modifyingRangeIndex, 1);
        } else {
          updatedRanges[modifyingRangeIndex] = newRange;
        }
        setSelectedRanges(updatedRanges);
      } else if (!isZeroSizeRange(newRange)) {
        // Add new range if it's not zero-size
        setSelectedRanges(prev => [...prev, newRange]);
      }
    }
    
    setIsSelecting(false);
    setStartCell(null);
    setEndCell(null);
    setModifyingRangeIndex(null);
  };

  const isZeroSizeRange = (range: Range) => {
    return range.start.day === range.end.day && range.start.hour === range.end.hour;
  };

  const isCellInRange = (day: number, hour: number, range?: Range) => {
    if (range) {
      return (
        day >= range.start.day && day <= range.end.day &&
        hour >= range.start.hour && hour <= range.end.hour
      );
    }

    // Check current selection
    if (isSelecting && startCell && endCell) {
      const minDay = Math.min(startCell.day, endCell.day);
import React from 'react';
import WarningText from './WarningText';
import { 
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
  PhotoIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon
} from '@heroicons/react/24/outline';

const SchedulerPreview: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <WarningText message="Esta función estará disponible próximamente" />

      {/* Schedule Preview */}
      <div className="bg-background rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray/20">
          <h2 className="text-lg font-medium">Vista previa del horario</h2>
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
          {/* Empty state preview */}
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray/20 rounded-lg">
            <div className="text-center text-gray mb-4">
              <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2" />
              <p>No hay horarios generados</p>
            </div>
            
            {/* Run Algorithm Button */}
            <button className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Cog6ToothIcon className="h-5 w-5" />
              <span>Generar Horarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-background rounded-lg shadow-sm">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Descargar PDF</div>
                <div className="text-sm text-gray">Formato para imprimir</div>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <PhotoIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Descargar imagen</div>
                <div className="text-sm text-gray">Formato PNG</div>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Google Calendar</div>
                <div className="text-sm text-gray">Exportar eventos y horarios</div>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <ShareIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Compartir</div>
                <div className="text-sm text-gray">Enviar por cualquier medio</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPreview;