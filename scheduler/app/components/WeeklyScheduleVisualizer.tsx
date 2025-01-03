import { ScheduleSlot, TimeBlock } from "../types/scheduler";
import { useState, useRef } from 'react';
import { FiSave } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SaveModal from './SaveModal';

interface WeeklyScheduleVisualizerProps {
  schedule: ScheduleSlot[];
  blockedTimes?: TimeBlock[];
}

const DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
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
  blockedTimes = [],
}) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const handleSaveAsPDF = async () => {
    if (!scheduleRef.current) return;
    
    const canvas = await html2canvas(scheduleRef.current);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('horario.pdf');
  };

  const handleSaveAsImage = async () => {
    if (!scheduleRef.current) return;
    
    const canvas = await html2canvas(scheduleRef.current);
    const link = document.createElement('a');
    link.download = 'horario.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleExportToCalendar = () => {
    // TODO: Implement Google Calendar export
    console.log('Export to Google Calendar');
  };

  const handleShareLink = () => {
    // TODO: Implement share link functionality
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado al portapapeles!');
  };

  return (
    <>
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveAsPDF={handleSaveAsPDF}
        onSaveAsImage={handleSaveAsImage}
        onExportToCalendar={handleExportToCalendar}
        onShareLink={handleShareLink}
      />
    </>
  );
};

export default WeeklyScheduleVisualizer; 