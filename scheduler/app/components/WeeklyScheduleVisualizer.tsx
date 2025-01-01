import { ScheduleSlot, TimeBlock } from "../types/scheduler";

interface WeeklyScheduleVisualizerProps {
  schedule: ScheduleSlot[];
  blockedTimes?: TimeBlock[];
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 to 21:00

const generateTimeLabel = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const getSlotStyle = (slot: ScheduleSlot) => {
  // Generate a consistent color based on subject_id
  const hue = parseInt(slot.subject_id.replace(/\D/g, '')) * 137.508; // Golden angle approximation
  return {
    backgroundColor: `hsl(${hue % 360}, 70%, 85%)`,
    top: `${getTopPosition(slot.timeFrom)}%`,
    height: `${getHeight(slot.timeFrom, slot.timeTo)}%`,
    width: '100%',
    position: 'absolute' as const,
    borderRadius: '0.375rem',
    padding: '0.5rem',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: `hsl(${hue % 360}, 70%, 75%)`,
  };
};

const getTopPosition = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 8 * 60; // 8:00
  return ((totalMinutes - startMinutes) / (13 * 60)) * 100; // 13 hours total (8:00 to 21:00)
};

const getHeight = (startTime: string, endTime: string) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  return (durationMinutes / (13 * 60)) * 100;
};

const WeeklyScheduleVisualizer: React.FC<WeeklyScheduleVisualizerProps> = ({
  schedule,
  blockedTimes = []
}) => {
  return (
    <div className="bg-background rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-[auto,repeat(5,1fr)] gap-2">
        {/* Time labels column */}
        <div className="space-y-4">
          <div className="h-12" /> {/* Header spacer */}
          {HOURS.map(hour => (
            <div key={hour} className="h-16 text-sm text-gray flex items-center justify-end pr-2">
              {generateTimeLabel(hour)}
            </div>
          ))}
        </div>

        {/* Days columns */}
        {DAYS.map(day => (
          <div key={day} className="relative">
            {/* Day header */}
            <div className="h-12 flex items-center justify-center font-medium">
              {day}
            </div>

            {/* Time grid */}
            <div className="relative h-[52rem] bg-secondaryBackground/30 rounded-lg">
              {/* Hour lines */}
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="absolute w-full h-[4rem] border-t border-gray/10"
                  style={{ top: `${((hour - 8) * 4)}rem` }}
                />
              ))}

              {/* Blocked times */}
              {blockedTimes
                .filter(block => block.day === day)
                .map((block, index) => (
                  <div
                    key={index}
                    className="absolute w-full bg-gray/20"
                    style={{
                      top: `${getTopPosition(block.from)}%`,
                      height: `${getHeight(block.from, block.to)}%`,
                    }}
                  />
                ))}

              {/* Schedule slots */}
              {schedule
                .filter(slot => slot.day === day)
                .map((slot, index) => (
                  <div
                    key={index}
                    style={getSlotStyle(slot)}
                    className="text-xs"
                  >
                    <div className="font-medium mb-1">{slot.subject}</div>
                    <div className="text-gray">
                      Com. {slot.commission}
                      <br />
                      {slot.building} - {slot.classroom}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyScheduleVisualizer; 