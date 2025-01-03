import React, { useState, useRef, useEffect } from 'react';
import { TimeBlock } from '../types/scheduler';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface WeeklyCalendarProps {
  onChange?: (blocks: TimeBlock[]) => void;
  initialBlocks?: TimeBlock[];
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ onChange, initialBlocks = [] }) => {
  const [selectedBlocks, setSelectedBlocks] = useState<TimeBlock[]>(initialBlocks);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<{ day: string; time: string } | null>(null);
  const dragOperation = useRef<'add' | 'remove' | null>(null);

  const dayNames = {
    short: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
    full: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  };
  
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const isBlockSelected = (day: string, time: string) => {
    return selectedBlocks.some(block => 
      block.day === day && block.from === time
    );
  };

  const handleClick = (day: string, time: string) => {
    if (!isDragging) {
      const isSelected = isBlockSelected(day, time);
      let newBlocks = [...selectedBlocks];
      
      if (isSelected) {
        newBlocks = newBlocks.filter(block => 
          !(block.day === day && block.from === time)
        );
      } else {
        const hour = parseInt(time.split(':')[0]);
        newBlocks.push({
          day,
          from: `${hour.toString().padStart(2, '0')}:00`,
          to: `${(hour + 1).toString().padStart(2, '0')}:00`
        });
      }
      
      setSelectedBlocks(newBlocks);
      onChange?.(newBlocks);
    }
  };

  const handleDragStart = (day: string, time: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartCell({ day, time });
    dragOperation.current = isBlockSelected(day, time) ? 'remove' : 'add';
  };

  const handleDragEnter = (day: string, time: string) => {
    if (isDragging && dragStartCell) {
      const isSelected = isBlockSelected(day, time);
      
      if (dragOperation.current === 'add' && !isSelected) {
        const hour = parseInt(time.split(':')[0]);
        const newBlock = {
          day,
          from: `${hour.toString().padStart(2, '0')}:00`,
          to: `${(hour + 1).toString().padStart(2, '0')}:00`
        };
        
        const newBlocks = [...selectedBlocks, newBlock];
        setSelectedBlocks(newBlocks);
        onChange?.(newBlocks);
      } else if (dragOperation.current === 'remove' && isSelected) {
        const newBlocks = selectedBlocks.filter(block => 
          !(block.day === day && block.from === time)
        );
        setSelectedBlocks(newBlocks);
        onChange?.(newBlocks);
      }
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStartCell(null);
      dragOperation.current = null;
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="bg-background rounded-lg px-4">
      <h3 className="font-medium text-textDefault mb-2">Horarios bloqueados</h3>
      <div className="text-sm text-textDefault mb-4">
      Los horarios bloqueados son períodos específicos en los que no deseas tener clases programadas. Estos espacios se reservan para:
      <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-textDefault">Actividades personales</h3>
                <p className="text-gray">Trabajo, almuerzo, ejercicio, tiempo en familia</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3>Tiempos de traslado</h3>
                <p className="text-gray">Viajes hacia y desde la universidad</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3>Compromisos fijos</h3>
                <p className="text-gray">Otras actividades académicas, cursos o responsabilidades</p>
              </div>
            </div>
          </div>

      </div>
      
      <div className="w-full">
        <div className="w-full">
          {/* Header with days */}
          <div className="grid grid-cols-6 gap-0.5 mb-0.5">
            <div className="h-8 flex items-center justify-center text-xs font-medium text-gray">
              Hora
            </div>
            {dayNames.short.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium bg-secondaryBackground rounded-md"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-6 gap-0.5 mb-0.5">
              <div className="h-8 flex items-center justify-center text-xs text-gray">
                {time}
              </div>
              {dayNames.full.map((day) => {
                const isSelected = isBlockSelected(day, time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className="flex-1"
                    onMouseDown={(e) => handleDragStart(day, time, e)}
                    onMouseEnter={() => handleDragEnter(day, time)}
                    onClick={() => handleClick(day, time)}
                    style={{ userSelect: 'none' }}
                  >
                    <div
                      className={`
                        w-full h-8 cursor-pointer
                        rounded-md transition-colors duration-100
                        ${isSelected
                          ? 'bg-primary'
                          : 'bg-secondaryBackground hover:bg-gray/10'
                        }
                      `}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;