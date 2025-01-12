import React, { useState, useEffect, useRef } from "react";
import { PossibleSchedule } from "../types/scheduler";
import ScheduleGrid from "./ScheduleGrid";
import { Scheduler } from "../services/scheduler";
import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Checkbox from "./Checkbox";
import SaveModal from "./SaveModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface SchedulerPreviewProps {
  schedules: PossibleSchedule[];
  setSchedules: (schedules: PossibleSchedule[]) => void;
  hasSubjects: boolean;
  onExportToCalendar: () => void;
}

interface ScheduleSettings {
  allowTimeOverlap: boolean;
  allowUnlimitedOverlap: boolean;
  avoidLocationChanges: boolean;
  haveFreeDay: boolean;
  timeFormat: "12h" | "24h";
}

export const SchedulerPreview: React.FC<SchedulerPreviewProps> = ({
  schedules = [],
  setSchedules = () => {},
  hasSubjects,
  onExportToCalendar,
}) => {
  const scheduler = Scheduler.getInstance();
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [lastOptionsString, setLastOptionsString] = useState(
    JSON.stringify(scheduler.getOptions())
  );
  const [lastSubjectsString, setLastSubjectsString] = useState(
    JSON.stringify(scheduler.getSubjects())
  );
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentOptionsString = JSON.stringify(scheduler.getOptions());
    const currentSubjectsString = JSON.stringify(scheduler.getSubjects());

    if (
      currentOptionsString !== lastOptionsString ||
      currentSubjectsString !== lastSubjectsString
    ) {
      setLastOptionsString(currentOptionsString);
      setLastSubjectsString(currentSubjectsString);
      setCurrentScheduleIndex(0);
    }
  }, [scheduler, lastOptionsString, lastSubjectsString]);

  // Update currentSchedule when schedules change
  useEffect(() => {
    if (schedules.length > 0) {
      setCurrentScheduleIndex(0);
    }
  }, [schedules]);

  // Filter schedules based on overlap option
  const filteredSchedules = schedules.filter((schedule) => {
    const options = scheduler.getOptions();
    const hasValidOverlap = options.allowUnlimitedOverlap || 
      (options.allowOverlap && schedule.maxOverlap <= 30) || 
      schedule.maxOverlap === 0;
    const hasValidFreeDay = !options.allowFreeDay || schedule.hasFreeDay;
    return hasValidOverlap && hasValidFreeDay;
  });

  // Reset current schedule index if it's out of bounds
  useEffect(() => {
    if (currentScheduleIndex >= filteredSchedules.length) {
      setCurrentScheduleIndex(0);
    }
  }, [filteredSchedules.length, currentScheduleIndex]);

  const currentSchedule = filteredSchedules[currentScheduleIndex];

  const handlePrevSchedule = () => {
    if (filteredSchedules.length > 0) {
      setCurrentScheduleIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSchedules.length - 1
      );
    }
  };

  const handleNextSchedule = () => {
    if (filteredSchedules.length > 0) {
      setCurrentScheduleIndex((prev) =>
        prev < filteredSchedules.length - 1 ? prev + 1 : 0
      );
    }
  };

  const [settings, setSettings] = useState<ScheduleSettings>({
    allowTimeOverlap: scheduler.getOptions().allowOverlap,
    allowUnlimitedOverlap: scheduler.getOptions().allowUnlimitedOverlap,
    avoidLocationChanges: scheduler.getOptions().avoidBuildingChange,
    haveFreeDay: scheduler.getOptions().allowFreeDay,
    timeFormat: "24h",
  });

  const hasSchedules =
    Array.isArray(filteredSchedules) && filteredSchedules.length > 0;

  const renderScheduleInfo = (schedule: PossibleSchedule) => {
    return (
      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
        <div className="flex flex-wrap gap-2 text-sm text-gray items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                schedule.maxOverlap ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span>
              {schedule.maxOverlap
                ? "Tiene superposición"
                : "Sin superposición"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                schedule.hasBuildingConflict ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span>
              {schedule.hasBuildingConflict
                ? "Conflicto de edificios"
                : "Sin conflicto de edificios"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                schedule.hasFreeDay ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>
              {schedule.hasFreeDay ? "Tiene día libre" : "Sin día libre"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray">
          <div className="w-5 h-5 border-2 border-dashed border-gray bg-surface"></div>
          <span>Horario bloqueado</span>
        </div>
      </div>
    );
  };

  const handleSaveAsPDF = async () => {
    if (!scheduleRef.current) return;

    const element = scheduleRef.current;
    
    // Create a wrapper with controlled styles
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.width = '1920px';
    wrapper.style.height = '1080px';
    wrapper.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--background').trim();
    wrapper.style.padding = '40px';
    wrapper.style.overflow = 'hidden';
    
    // Clone the schedule element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '100%';
    clone.style.height = '100%';
    clone.style.transform = 'scale(1)';
    clone.style.transformOrigin = 'top left';
    
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null,
        width: 1920,
        height: 1080,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { 
              font-family: Arial, Roboto, sans-serif !important;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Update day headers text
          const dayHeaders = clonedDoc.querySelectorAll('.grid-cols-\\[auto_1fr_1fr_1fr_1fr_1fr\\] > div');
          const fullDayNames: { [key: string]: string } = {
            'Lun': 'Lunes',
            'Mar': 'Martes',
            'Mie': 'Miércoles',
            'Jue': 'Jueves',
            'Vie': 'Viernes'
          };
          
          dayHeaders.forEach((header: Element, index) => {
            if (index > 0) { // Skip "Hora" header
              const text = header.textContent?.trim() || '';
              Object.entries(fullDayNames).forEach(([short, full]) => {
                if (text.includes(short)) {
                  header.textContent = full;
                }
              });
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
        hotfixes: ['px_scaling']
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('horario.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const handleSaveAsImage = async () => {
    if (!scheduleRef.current) return;

    const element = scheduleRef.current;
    
    // Create a wrapper with controlled styles
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.width = '1920px';
    wrapper.style.height = '1080px';
    wrapper.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--background').trim();
    wrapper.style.padding = '40px';
    wrapper.style.overflow = 'hidden';
    
    // Clone the schedule element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '100%';
    clone.style.height = '100%';
    clone.style.transform = 'scale(1)';
    clone.style.transformOrigin = 'top left';
    
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null,
        width: 1920,
        height: 1080,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { 
              font-family: Arial, Roboto, sans-serif !important;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Update day headers text
          const dayHeaders = clonedDoc.querySelectorAll('.grid-cols-\\[auto_1fr_1fr_1fr_1fr_1fr\\] > div');
          const fullDayNames: { [key: string]: string } = {
            'Lun': 'Lunes',
            'Mar': 'Martes',
            'Mie': 'Miércoles',
            'Jue': 'Jueves',
            'Vie': 'Viernes'
          };
          
          dayHeaders.forEach((header: Element, index) => {
            if (index > 0) { // Skip "Hora" header
              const text = header.textContent?.trim() || '';
              Object.entries(fullDayNames).forEach(([short, full]) => {
                if (text.includes(short)) {
                  header.textContent = full;
                }
              });
            }
          });
        }
      });

      // Create a download link for the image
      const link = document.createElement('a');
      link.download = 'horario.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const handleShareLink = () => {
    // TODO: Implement share link functionality
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("¡Enlace copiado al portapapeles!");
  };

  return (
    <div className="flex flex-col">
      <div className="bg-background rounded-lg px-4">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-end">
          <Checkbox
            id="allowOverlap"
            checked={settings.allowTimeOverlap && !settings.allowUnlimitedOverlap}
            onChange={(checked) => {
              const newSettings = {
                ...settings,
                allowTimeOverlap: checked,
                allowUnlimitedOverlap: false
              };
              setSettings(newSettings);
              scheduler.setOptions({
                ...scheduler.getOptions(),
                allowOverlap: checked,
                allowUnlimitedOverlap: false
              });
              setSchedules(scheduler.generateSchedules());
            }}
            label="Permitir superposición limitada"
            isTooltip={true}
            tooltip="Máx. diferencia: 30 mins"
            disabled={settings.allowUnlimitedOverlap}
          />

          <Checkbox
            id="allowUnlimitedOverlap"
            checked={settings.allowUnlimitedOverlap}
            onChange={(checked) => {
              const newSettings = {
                ...settings,
                allowUnlimitedOverlap: checked,
                allowTimeOverlap: checked
              };
              setSettings(newSettings);
              scheduler.setOptions({
                ...scheduler.getOptions(),
                allowUnlimitedOverlap: checked,
                allowOverlap: checked
              });
              setSchedules(scheduler.generateSchedules());
            }}
            label="Permitir superposición completa"
            isTooltip={true}
            tooltip="Sin límite de superposición"
            disabled={settings.allowTimeOverlap && !settings.allowUnlimitedOverlap}
          />

          <Checkbox
            id="freeDay"
            checked={settings.haveFreeDay}
            onChange={(checked) => {
              const newSettings = { ...settings, haveFreeDay: checked };
              setSettings(newSettings);
              scheduler.setOptions({
                ...scheduler.getOptions(),
                allowFreeDay: checked,
              });
              setSchedules(scheduler.generateSchedules());
            }}
            label="Tener un día libre"
          />
        </div>
        <div className="flex items-center justify-between pt-6 border-b border-gray/20">
          <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-textDefault pb-2">
          Vista previa de horarios</h2>
            {hasSubjects && hasSchedules && (
              <span className="text-xs text-gray text-end whitespace-nowrap flex-shrink-0">
                Opción {currentScheduleIndex + 1} de {filteredSchedules.length}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {hasSubjects && hasSchedules && (
              <>
                {filteredSchedules.length > 1 && (
                  <>
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
                  </>
                )}
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="p-2 text-gray hover:bg-secondaryBackground rounded-lg"
                  title="Guardar horario"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="py-4" ref={scheduleRef}>
          {!hasSubjects ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray">
              <div className="text-center text-gray mb-4">
                <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="mb-2 text-sm">No hay materias seleccionadas</div>
              </div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray rounded-lg">
              <div className="text-center text-gray mb-4">
                <XMarkIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="mb-2 text-sm">No hay combinaciones posibles para esta configuración</div>
              </div>
            </div>
          ) : currentSchedule ? (
            <>
              <div>
                <ScheduleGrid slots={currentSchedule.slots} />
              </div>
              {/* Schedule Info */}
              <div className="mt-4">
                {renderScheduleInfo(currentSchedule)}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveAsPDF={handleSaveAsPDF}
        onSaveAsImage={handleSaveAsImage}
        onExportToCalendar={onExportToCalendar}
        onShareLink={handleShareLink}
      />
    </div>
  );
};
