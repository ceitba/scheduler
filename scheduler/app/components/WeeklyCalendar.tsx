import React, { useState, useRef } from 'react';

interface TimeBlock {
  day: number;
  time: string;
  isBlocked: boolean;
}

interface WeeklyCalendarProps {
  onChange?: (blocks: TimeBlock[]) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ onChange }) => {
  const [selectedBlocks, setSelectedBlocks] = useState<TimeBlock[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<{ day: number; time: string } | null>(null);
  const [modifyingSelection, setModifyingSelection] = useState(false);
  const dragOperation = useRef<'add' | 'remove' | null>(null);

  const dayNames = {
    short: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
    full: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  };
  
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
  });

  const isBlockSelected = (day: number, time: string) => {
    return selectedBlocks.some(block => 
      block.day === day && block.time === time && block.isBlocked
    );
  };

  const handleClick = (day: number, time: string, e: React.MouseEvent) => {
    if (!isDragging) {
      // Toggle single cell on click
      const isSelected = isBlockSelected(day, time);
      let newBlocks = [...selectedBlocks];
      
      if (isSelected) {
        newBlocks = newBlocks.filter(block => 
          !(block.day === day && block.time === time)
        );
      } else {
        newBlocks.push({ day, time, isBlocked: true });
      }
      
      setSelectedBlocks(newBlocks);
      onChange?.(newBlocks);
    }
  };

  const handleDragStart = (day: number, time: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartCell({ day, time });
    
    // Check if we're starting on an existing selection
    const isSelected = isBlockSelected(day, time);
    if (isSelected) {
      setModifyingSelection(true);
      dragOperation.current = 'remove';
    } else {
      setModifyingSelection(false);
      dragOperation.current = 'add';
    }
  };

  const handleDragEnter = (day: number, time: string) => {
    if (!isDragging || !dragStartCell || dragOperation.current === null) return;

    const startTime = timeSlots.indexOf(dragStartCell.time);
    const currentTime = timeSlots.indexOf(time);
    const startDay = dragStartCell.day;
    
    const minTime = Math.min(startTime, currentTime);
    const maxTime = Math.max(startTime, currentTime);
    const minDay = Math.min(startDay, day);
    const maxDay = Math.max(startDay, day);

    let newBlocks = [...selectedBlocks];

    // Remove blocks in the current selection area
    newBlocks = newBlocks.filter(block => 
      !(block.day >= minDay && block.day <= maxDay && 
        timeSlots.indexOf(block.time) >= minTime && 
        timeSlots.indexOf(block.time) <= maxTime)
    );

    // Add new blocks if we're adding (not removing)
    if (dragOperation.current === 'add') {
      for (let d = minDay; d <= maxDay; d++) {
        for (let t = minTime; t <= maxTime; t++) {
          newBlocks.push({
            day: d,
            time: timeSlots[t],
            isBlocked: true
          });
        }
      }
    }

    setSelectedBlocks(newBlocks);
    onChange?.(newBlocks);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartCell(null);
    dragOperation.current = null;
    setModifyingSelection(false);
  };

  return (
    <div 
      className="bg-background w-full"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="my-2">
        <h3 className="font-medium text-textDefault">Horarios bloqueados</h3>
        <p className="text-sm text-gray mt-1">
          Selecciona los horarios en los que no puedes cursar
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex flex-col p-1 w-full min-w-[280px] gap-0.5">
          {/* Header row */}
          <div className="flex w-full">
            <div className="w-[40px] md:w-[60px] lg:w-[80px] p-1 rounded-lg bg-background text-[10px] md:text-xs lg:text-sm font-medium text-center mr-0.5 shrink-0">
              #
            </div>
            <div className="flex flex-1 gap-0.5">
              {dayNames.short.map((day, index) => (
                <div
                  key={day}
                  className="flex-1 p-1 rounded-lg bg-background text-[10px] md:text-xs lg:text-sm font-medium text-center"
                >
                  <span className="hidden lg:block">{dayNames.full[index]}</span>
                  <span className="block lg:hidden">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="flex flex-col gap-0.5">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className="flex w-full">
                <div className="w-[40px] md:w-[60px] lg:w-[80px] p-1 rounded-lg bg-background text-[10px] md:text-xs lg:text-sm text-gray text-center mr-0.5 shrink-0">
                  <span className="hidden md:inline">{time.split(' - ')[0]}</span>
                  <span className="inline md:hidden">{time.split(':')[0]}</span>
                </div>
                <div className="flex flex-1 gap-0.5">
                  {dayNames.short.map((_, dayIndex) => {
                    const isSelected = isBlockSelected(dayIndex, time);
                    return (
                      <div
                        key={`${dayIndex}-${time}`}
                        className="flex-1"
                        onMouseDown={(e) => handleDragStart(dayIndex, time, e)}
                        onMouseEnter={() => handleDragEnter(dayIndex, time)}
                        onClick={(e) => handleClick(dayIndex, time, e)}
                        style={{ userSelect: 'none' }}
                      >
                        <div
                          className={`
                            w-full h-5 md:h-6 lg:h-8 cursor-pointer
                            rounded-lg transition-colors duration-100
                            ${isSelected
                              ? 'bg-primary'
                              : 'bg-background hover:bg-secondaryBackground'
                            }
                          `}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;