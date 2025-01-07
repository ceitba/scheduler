import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TimeBlock } from '../types/scheduler';
import { CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import BaseModal from './BaseModal';

interface LabeledTimeBlock extends TimeBlock {
  id: string;
  label?: string;
  from: string;
  to: string;
}

interface WeeklyCalendarProps {
  onChange?: (blocks: LabeledTimeBlock[]) => void;
  initialBlocks?: LabeledTimeBlock[];
}

interface EditModalProps {
  block: LabeledTimeBlock;
  onSave: (block: LabeledTimeBlock) => void;
  onClose: () => void;
  onDelete: () => void;
}

interface SelectionState {
  day: string;
  startHour: number;
  endHour: number | null;
}

const dayTranslations: { [key: string]: string } = {
  'MONDAY': 'Lunes',
  'TUESDAY': 'Martes',
  'WEDNESDAY': 'Miércoles',
  'THURSDAY': 'Jueves',
  'FRIDAY': 'Viernes'
};

const EditModal: React.FC<EditModalProps> = ({ block, onSave, onClose, onDelete }) => {
  const [label, setLabel] = useState(block.label || '');

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Editar bloque"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título del bloque</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray rounded-lg bg-secondaryBackground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: Almuerzo, Trabajo, etc."
          />
        </div>
        <div className="text-sm text-gray">
          {dayTranslations[block.day]} {block.from} - {block.to}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => onDelete()}
            className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg"
          >
            Eliminar
          </button>
          <button
            onClick={() => onSave({ ...block, label })}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Guardar
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ onChange, initialBlocks = [] }) => {
  const [selectedBlocks, setSelectedBlocks] = useState<LabeledTimeBlock[]>(
    initialBlocks.map(block => ({ ...block, id: block.id || crypto.randomUUID() }))
  );
  const [editingBlock, setEditingBlock] = useState<LabeledTimeBlock | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const dayNames = {
    short: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
    full: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  };
  
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getBlocksForDay = (day: string): LabeledTimeBlock[] => {
    return selectedBlocks.filter(block => block.day === day)
      .sort((a, b) => parseInt(a.from) - parseInt(b.from));
  };

  const getBlockHeight = (from: string, to: string): number => {
    const fromHour = parseInt(from.split(':')[0]);
    const toHour = parseInt(to.split(':')[0]);
    return (toHour - fromHour) * 32; // 32px per hour
  };

  const getBlockTop = (from: string): number => {
    const fromHour = parseInt(from.split(':')[0]);
    return (fromHour - 8) * 32; // Offset from 8:00
  };

  const getHourFromPosition = (y: number): number => {
    const cellHeight = 32; // height of each time slot in pixels
    const gridHeight = cellHeight * 14; // total height of the grid (14 time slots)
    
    // If we're at or beyond the last cell, return 22 (last hour)
    if (y >= gridHeight - cellHeight / 2) {
      return 22;
    }
    
    const hour = Math.floor(y / cellHeight) + 8;
    return Math.min(Math.max(hour, 8), 21);
  };

  const handleMouseDown = (day: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const hour = getHourFromPosition(relativeY);
    
    setIsSelecting(true);
    setSelection({
      day,
      startHour: hour,
      endHour: hour
    });
  };

  const handleMouseMove = useCallback(
    (day: string, e: React.MouseEvent) => {
      if (isSelecting && selection && day === selection.day) {
        const rect = e.currentTarget.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const hour = getHourFromPosition(relativeY);

        setSelection(prev => {
          if (!prev) return null;
          return {
            ...prev,
            endHour: hour
          };
        });
      }
    },
    [isSelecting, selection]
  );

  const handleMouseUp = useCallback(() => {
    if (selection) {
      const { day, startHour, endHour } = selection;

      const hasOverlap = (newBlock: LabeledTimeBlock): boolean => {
        return selectedBlocks.some(block => {
          if (block.day !== newBlock.day) return false;
          const newStart = parseInt(newBlock.from);
          const newEnd = parseInt(newBlock.to);
          const blockStart = parseInt(block.from);
          const blockEnd = parseInt(block.to);
          return (newStart < blockEnd && newEnd > blockStart);
        });
      };

      // For single click or small drags, create a 1-hour block
      if (endHour && (Math.abs(endHour - startHour) <= 1)) {
        const newBlock: LabeledTimeBlock = {
          id: crypto.randomUUID(),
          day,
          from: `${startHour.toString().padStart(2, '0')}:00`,
          to: `${(startHour + 1).toString().padStart(2, '0')}:00`
        };
        
        if (!hasOverlap(newBlock)) {
          setSelectedBlocks(prev => [...prev, newBlock]);
          onChange?.([...selectedBlocks, newBlock]);
        }
      } 
      // For longer drags, create a block with the dragged duration
      else if (endHour && Math.abs(endHour - startHour) > 1) {
        const [start, end] = [Math.min(startHour, endHour), Math.max(startHour, endHour)];
        const newBlock: LabeledTimeBlock = {
          id: crypto.randomUUID(),
          day,
          from: `${start.toString().padStart(2, '0')}:00`,
          to: `${end.toString().padStart(2, '0')}:00`
        };
        
        if (!hasOverlap(newBlock)) {
          setSelectedBlocks(prev => [...prev, newBlock]);
          onChange?.([...selectedBlocks, newBlock]);
        }
      }
    }
    setIsSelecting(false);
    setSelection(null);
  }, [selection, selectedBlocks, onChange]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleSaveBlock = (updatedBlock: LabeledTimeBlock) => {
    const newBlocks = selectedBlocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    setSelectedBlocks(newBlocks);
    onChange?.(newBlocks);
    setEditingBlock(null);
  };

  const handleDeleteBlock = () => {
    if (editingBlock) {
      const newBlocks = selectedBlocks.filter(block => block.id !== editingBlock.id);
      setSelectedBlocks(newBlocks);
      onChange?.(newBlocks);
      setEditingBlock(null);
    }
  };

  // Prevent vertical scrolling on touch devices
  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    calendar.addEventListener('touchmove', preventScroll, { passive: false });
    return () => calendar.removeEventListener('touchmove', preventScroll);
  }, []);

  // Add touch event handlers
  const handleTouchStart = (day: string, e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = touch.clientY - rect.top;
    const hour = getHourFromPosition(relativeY);
    
    setIsSelecting(true);
    setSelection({
      day,
      startHour: hour,
      endHour: hour
    });
  };

  const handleTouchMove = (day: string, e: React.TouchEvent) => {
    if (isSelecting && selection && day === selection.day) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeY = touch.clientY - rect.top;
      const hour = getHourFromPosition(relativeY);

      setSelection(prev => {
        if (!prev) return null;
        return {
          ...prev,
          endHour: hour
        };
      });
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Get color for a block
  const getBlockColor = (blockId: string) => {
    const index = (selectedBlocks.findIndex(b => b.id === blockId) % 10) + 1;
    return `bg-subject_color_${index}`;
  };

  return (
    <div className="bg-background rounded-lg px-4">
      <h2 className="text-lg font-semibold text-textDefault pb-2">
        Horarios bloqueados</h2>
      <div className="text-sm text-textDefault mb-4">
      Los horarios bloqueados son períodos específicos en los que no deseas tener clases programadas. Estos espacios se pueden reservan para:
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
                <h3 className="text-textDefault">Tiempos de traslado</h3>
                <p className="text-gray">Viajes hacia y desde la universidad</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-textDefault">Compromisos fijos</h3>
                <p className="text-gray">Otras actividades académicas, cursos o responsabilidades</p>
              </div>
            </div>
          </div>
      </div>
      
      <div className="w-full select-none" ref={calendarRef}>
        <div className="w-full">
          {/* Header with days */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5 mb-0.5">
            <div className="h-8 flex items-center justify-start text-xs min-w-[40px] font-medium text-textDefault">
              Hora
            </div>
            {dayNames.short.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center text-center justify-center text-xs font-medium bg-secondaryBackground rounded-md"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5">
            {/* Time labels */}
            <div className="space-y-0.8">
              {timeSlots.map((time) => (
                <div key={time} className="h-8 flex items-center justify-left text-center text-[11px] text-textDefault min-w-[40px]">
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {dayNames.full.map((day) => (
              <div key={day} className="relative h-[448px] bg-secondaryBackground rounded-md">
                {/* Hour separator lines */}
                {timeSlots.map((_, index) => (
                  <div
                    key={index}
                    className="absolute w-full"
                    style={{ top: `${index * 32}px` }}
                  >
                    {/* Main hour line */}
                    <div className="absolute inset-x-0 h-[1px] bg-background" />
                  </div>
                ))}

                {/* Selection overlay */}
                {selection && selection.day === day && selection.endHour && (
                  <div
                    className="absolute select-none inset-x-0 bg-background flex flex-col items-center justify-center transition-all duration-75 ease-out"
                    style={{
                      top: `${(Math.min(selection.startHour, selection.endHour) - 8) * 32}px`,
                      height: `${Math.abs(selection.endHour - selection.startHour) * 32}px`,
                    }}
                  >
                    {Math.abs(selection.endHour - selection.startHour) >= 1 && (
                      <span className="text-[11px] text-center text-textDefault font-medium select-none">
                        {`${Math.min(selection.startHour, selection.endHour)}:00 - ${Math.max(selection.startHour, selection.endHour)}:00`}
                      </span>
                    )}
                  </div>
                )}

                {/* Interactive cells */}
                <div
                  className="absolute inset-0 cursor-pointer touch-none"
                  onMouseDown={(e) => handleMouseDown(day, e)}
                  onMouseMove={(e) => handleMouseMove(day, e)}
                  onTouchStart={(e) => handleTouchStart(day, e)}
                  onTouchMove={(e) => handleTouchMove(day, e)}
                  onTouchEnd={handleTouchEnd}
                />

                {/* Blocks */}
                {getBlocksForDay(day).map((block) => {
                  const height = getBlockHeight(block.from, block.to);
                  const top = getBlockTop(block.from);
                  const colorClass = getBlockColor(block.id);

                  return (
                    <button
                      key={block.id}
                      onClick={() => setEditingBlock(block)}
                      className={`absolute inset-x-0 flex flex-col items-center justify-center hover:brightness-90 text-textDefault cursor-pointer group/block transition-all px-2 z-10 select-none ${colorClass}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        borderRadius: top === 0 ? '6px 6px 0 0' : top + height === 448 ? '0 0 6px 6px' : '0'
                      }}
                    >
                      {block.label ? (
                        <div className="flex flex-col items-center justify-center w-full h-full p-1">
                          <span className="text-xs font-medium truncate w-full text-center">{block.label}</span>
                          <span className="text-[11px] text-textDefault w-full text-center">
                            {block.from} - {block.to}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-[11px] text-textDefault w-full text-center">
                            {block.from} - {block.to}
                          </span>
                        </div>
                      )}
                      <PencilIcon className="absolute right-2 h-4 w-4 opacity-0 group-hover/block:opacity-100" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingBlock && (
        <EditModal
          block={editingBlock}
          onSave={handleSaveBlock}
          onClose={() => setEditingBlock(null)}
          onDelete={handleDeleteBlock}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar;