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
  const dragOperation = useRef<'add' | 'remove' | null>(null);

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
  });

  const isBlockSelected = (day: number, time: string) => {
    return selectedBlocks.some(block => 
      block.day === day && block.time === time && block.isBlocked
    );
  };

  const handleDragStart = (day: number, time: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartCell({ day, time });
    dragOperation.current = isBlockSelected(day, time) ? 'remove' : 'add';
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

    newBlocks = newBlocks.filter(block => 
      !(block.day >= minDay && block.day <= maxDay && 
        timeSlots.indexOf(block.time) >= minTime && 
        timeSlots.indexOf(block.time) <= maxTime)
    );

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
  };

  return (
    <div 
      className="bg-background"
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
        <div className="inline-flex select-none min-w-max flex-col p-1">
          {/* Header row */}
          <div className="flex">
            <div className="w-[100px] p-2 rounded-lg bg-background text-sm font-medium text-center mr-0.5">
              #
            </div>
            {days.map(day => (
              <div
                key={day}
                className="w-[140px] p-2 rounded-lg bg-background text-sm font-medium text-center mx-0.5"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="flex">
              <div className="w-[100px] p-2 rounded-lg bg-background text-xs text-gray text-center mr-0.5">
                {time}
              </div>
              {days.map((_, dayIndex) => {
                const isSelected = isBlockSelected(dayIndex, time);
                return (
                  <div
                    key={`${dayIndex}-${time}`}
                    className="w-[140px] mx-0.5"
                    onMouseDown={(e) => handleDragStart(dayIndex, time, e)}
                    onMouseEnter={() => handleDragEnter(dayIndex, time)}
                    style={{ userSelect: 'none' }}
                  >
                    <div
                      className={`
                        w-full h-[1.75rem] cursor-pointer
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;