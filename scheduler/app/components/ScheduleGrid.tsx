import React from 'react';
import { ScheduleSlot, TimeBlock } from '../types/scheduler';
import { Scheduler } from '../services/scheduler';

interface ScheduleGridProps {
  slots: ScheduleSlot[];
}

interface GroupedSlot {
  subject: string;
  subject_id: string;
  commission: string;
  rooms: Array<{ classroom: string; building: string; }>;
  timeFrom: string;
  timeTo: string;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ slots }) => {
  const scheduler = Scheduler.getInstance();
  const blockedTimes = scheduler.getBlockedTimes();
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const dayNames = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'];

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const calculateSlotPosition = (timeFrom: string, timeTo: string) => {
    const startTime = timeToMinutes(timeFrom);
    const endTime = timeToMinutes(timeTo);
    const gridStart = 8 * 60; // 8:00
    const hourHeight = 48; // height of one hour in pixels

    const top = ((startTime - gridStart) / 60) * hourHeight;
    const height = ((endTime - startTime) / 60) * hourHeight;

    return { top, height };
  };

  // Group slots by day and time, combining same subject+commission slots
  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = new Map<string, GroupedSlot>();
    }

    const key = `${slot.subject_id}-${slot.commission}-${slot.timeFrom}`;
    const existingSlot = acc[slot.day].get(key);
    
    if (existingSlot) {
      existingSlot.rooms.push({ classroom: slot.classroom, building: slot.building });
    } else {
      acc[slot.day].set(key, {
        subject: slot.subject,
        subject_id: slot.subject_id,
        commission: slot.commission,
        timeFrom: slot.timeFrom,
        timeTo: slot.timeTo,
        rooms: [{ classroom: slot.classroom, building: slot.building }]
      });
    }
    
    return acc;
  }, {} as Record<string, Map<string, GroupedSlot>>);

  // Convert blocked times to slot format for visualization
  const blockedSlots = blockedTimes.map(block => ({
    timeFrom: block.from,
    timeTo: block.to,
    day: block.day,
    isBlocked: true
  }));

  const getSlotsForDay = (day: string): GroupedSlot[] => {
    return Array.from(slotsByDay[day]?.values() || []);
  };

  const formatRooms = (rooms: Array<{ classroom: string; building: string; }>) => {
    if (rooms.length === 1) {
      return `${rooms[0].classroom} (${rooms[0].building})`;
    }
    return rooms.map(r => r.classroom).join(', ');
  };

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Header with days */}
        <div className="grid grid-cols-6 gap-0.5 mb-0.5">
          <div className="h-8 flex items-center justify-center text-xs font-medium text-gray">
            Hora
          </div>
          {dayNames.map((day, index) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium bg-secondaryBackground rounded-md"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-6 gap-0.5">
          {/* Time labels */}
          <div className="relative">
            {timeSlots.map((time) => (
              <div key={time} className="h-12 flex items-center justify-center text-xs text-gray">
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const daySlots = getSlotsForDay(day);
            const overlappingGroups = new Map<string, GroupedSlot[]>();
            
            // Group overlapping slots
            daySlots.forEach(slot => {
              const slotStart = timeToMinutes(slot.timeFrom);
              const slotEnd = timeToMinutes(slot.timeTo);
              
              let foundGroup = false;
              for (const [timeKey, group] of overlappingGroups.entries()) {
                const [groupStart, groupEnd] = timeKey.split('-').map(Number);
                if (slotStart < groupEnd && slotEnd > groupStart) {
                  group.push(slot);
                  foundGroup = true;
                  break;
                }
              }
              
              if (!foundGroup) {
                overlappingGroups.set(`${slotStart}-${slotEnd}`, [slot]);
              }
            });

            return (
              <div key={day} className="relative h-[672px]"> {/* 14 hours * 48px */}
                {/* Background grid lines */}
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="absolute w-full h-12 bg-secondaryBackground"
                    style={{ top: (timeToMinutes(time) - 8 * 60) / 60 * 48 }}
                  />
                ))}

                {/* Blocked time slots */}
                {blockedSlots
                  .filter(block => block.day === day)
                  .map((block, index) => {
                    const { top, height } = calculateSlotPosition(block.timeFrom, block.timeTo);
                    return (
                      <div
                        key={`blocked-${block.day}-${block.timeFrom}-${index}`}
                        className="absolute w-full p-1 bg-white border-2 border-dashed border-gray-300"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          zIndex: 1
                        }}
                      >
                        <div className="h-full flex flex-col justify-center items-center text-[10px] text-gray">
                          <div>Horario bloqueado</div>
                          <div>{block.timeFrom} - {block.timeTo}</div>
                        </div>
                      </div>
                    );
                  })}

                {/* Course slots */}
                {Array.from(overlappingGroups.values()).map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {group.map((slot, slotIndex) => {
                      const { top, height } = calculateSlotPosition(slot.timeFrom, slot.timeTo);
                      const hasOverlap = group.length > 1;
                      const width = hasOverlap ? `${100 / group.length}%` : '100%';
                      const left = hasOverlap ? `${(slotIndex * 100) / group.length}%` : '0';

                      return (
                        <div
                          key={`${slot.subject_id}-${slot.commission}-${slot.timeFrom}`}
                          className={`absolute p-1 rounded-md ${
                            hasOverlap
                              ? 'opacity-70 bg-red-500/20'
                              : 'bg-primary/10 border border-primary'
                          }`}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            width,
                            left,
                            zIndex: 2
                          }}
                        >
                          <div className="h-full flex flex-col justify-between text-[10px] leading-tight">
                            <div className="font-medium truncate">{slot.subject}</div>
                            <div className="text-gray truncate">
                              <div>Com. {slot.commission}</div>
                              <div className="truncate">{formatRooms(slot.rooms)}</div>
                              <div className="truncate">{slot.timeFrom} - {slot.timeTo}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid; 