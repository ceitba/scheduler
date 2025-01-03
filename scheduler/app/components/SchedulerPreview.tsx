import React, { useState, useEffect, useRef } from "react";
import { PossibleSchedule } from "../types/scheduler";
import ScheduleGrid from "./ScheduleGrid";
import { Scheduler } from "../services/scheduler";
import {
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
} from "@heroicons/react/24/outline";
import Checkbox from "./Checkbox";
import SaveModal from './SaveModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SchedulerPreviewProps {
  schedules: PossibleSchedule[];
  onGenerateSchedules: () => void;
  hasSubjects: boolean;
}

interface ScheduleSettings {
  allowTimeOverlap: boolean;
  avoidLocationChanges: boolean;
  haveFreeDay: boolean;
  timeFormat: "12h" | "24h";
}

export const SchedulerPreview: React.FC<SchedulerPreviewProps> = ({
  schedules = [],
  onGenerateSchedules,
  hasSubjects,
}) => {
  const scheduler = Scheduler.getInstance();
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const [lastOptionsString, setLastOptionsString] = useState(
    JSON.stringify(scheduler.getOptions())
  );
  const [lastSubjectsString, setLastSubjectsString] = useState(
    JSON.stringify(scheduler.getSubjects())
  );
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Reset generation state when options or subjects change
  useEffect(() => {
    const currentOptionsString = JSON.stringify(scheduler.getOptions());
    const currentSubjectsString = JSON.stringify(scheduler.getSubjects());

    if (
      currentOptionsString !== lastOptionsString ||
      currentSubjectsString !== lastSubjectsString
    ) {
      setLastOptionsString(currentOptionsString);
      setLastSubjectsString(currentSubjectsString);
      setHasAttemptedGeneration(false);
      setCurrentScheduleIndex(0); // Reset index when options or subjects change
    }
  }, [scheduler.getOptions(), scheduler.getSubjects()]);

  // Reset current index when schedules array changes
  useEffect(() => {
    setCurrentScheduleIndex(0);
  }, [schedules]);

  // Filter schedules based on overlap option
  const filteredSchedules = schedules.filter((schedule) => {
    const options = scheduler.getOptions();
    return (options.allowOverlap || !schedule.hasOverlap) && (!options.allowFreeDay || schedule.hasFreeDay);
  });

  const handleGenerateClick = () => {
    setHasAttemptedGeneration(true);
    setCurrentScheduleIndex(0); // Reset index when generating new schedules
    onGenerateSchedules();
  };

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
    avoidLocationChanges: scheduler.getOptions().avoidBuildingChange,
    haveFreeDay: scheduler.getOptions().allowFreeDay,
    timeFormat: "24h",
  });

  const hasSchedules =
    Array.isArray(filteredSchedules) && filteredSchedules.length > 0;
  const currentSchedule = hasSchedules
    ? filteredSchedules[currentScheduleIndex]
    : null;

  const renderScheduleInfo = (schedule: PossibleSchedule) => {
    return (
      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
        <div className="flex flex-wrap gap-2 text-sm text-gray items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                schedule.hasOverlap ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span>
              {schedule.hasOverlap
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
            <div className="w-5 h-5 border-2 border-dashed border-gray rounded-md bg-surface"></div>
            <span>Horario bloqueado</span>
          </div>
      </div>
    );
  };

  
  const handleSaveAsPDF = async () => {
    if (!scheduleRef.current) return;
    
    const element = scheduleRef.current as HTMLElement;
    
    // First, create a wrapper that will maintain the layout
    const wrapper = document.createElement('div');
    wrapper.style.padding = '40px';
    wrapper.style.backgroundColor = 'var(--background)';
    wrapper.style.width = '100%';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    
    // Clone and prepare the content
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Force the clone to take up proper width
    clone.style.width = '1200px';  // Set a reasonable fixed width
    clone.style.minWidth = '1200px';
    clone.style.position = 'relative';
    clone.style.margin = '0 auto';
    clone.style.display = 'flex';
    clone.style.flexDirection = 'column';
    
    // Ensure all child elements expand properly
    const childElements = clone.getElementsByTagName('*');
    Array.from(childElements).forEach((el: Element) => {
      if (el instanceof HTMLElement) {
        if (getComputedStyle(el).display === 'flex') {
          el.style.width = '100%';
        }
      }
    });
    
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    
    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: true,
        removeContainer: true,
        allowTaint: true,
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--background').trim(),
        windowWidth: 1300, // Match the clone width
        width: 1300,
      });
  
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for PDF (maintaining aspect ratio)
      const pdfWidth = 1400;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'l',
        unit: 'px',
        format: [pdfWidth, pdfHeight],
        hotfixes: ['px_scaling']
      });
  
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('horario.pdf');
    } finally {
      document.body.removeChild(wrapper);
    }
  };
  
  const handleSaveAsImage = async () => {
    if (!scheduleRef.current) return;
    
    const element = scheduleRef.current as HTMLElement;
    
    const wrapper = document.createElement('div');
    wrapper.style.padding = '40px';
    wrapper.style.backgroundColor = 'var(--background)';
    wrapper.style.width = '100%';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '1200px';
    clone.style.minWidth = '1200px';
    clone.style.position = 'relative';
    clone.style.margin = '0 auto';
    clone.style.display = 'flex';
    clone.style.flexDirection = 'column';
    
    const childElements = clone.getElementsByTagName('*');
    Array.from(childElements).forEach((el: Element) => {
      if (el instanceof HTMLElement) {
        if (getComputedStyle(el).display === 'flex') {
          el.style.width = '100%';
        }
      }
    });
    
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    
    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: true,
        removeContainer: true,
        allowTaint: true,
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--background').trim(),
        windowWidth: 1400,
        width: 1400,
      });
  
      const link = document.createElement('a');
      link.download = 'horario.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      document.body.removeChild(wrapper);
    }
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
    <div className="max-w-7xl mx-auto h-fit space-y-6">
      <div className="bg-background rounded-lg">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-end px-4">
          <Checkbox
            id="allowOverlap"
            checked={settings.allowTimeOverlap}
            onChange={(checked) => {
              setSettings((prev) => ({ ...prev, allowTimeOverlap: checked }));
              scheduler.setOptions({
                ...scheduler.getOptions(),
                allowOverlap: checked,
              });
              if (hasAttemptedGeneration) {
                onGenerateSchedules();
              }
            }}
            label="Permitir superposición de horarios"
          />

          <Checkbox
            id="freeDay"
            checked={settings.haveFreeDay}
            onChange={(checked) => {
              setSettings((prev) => ({ ...prev, haveFreeDay: checked }));
              scheduler.setOptions({
                ...scheduler.getOptions(),
                allowFreeDay: checked,
              });
              if (hasAttemptedGeneration) {
                onGenerateSchedules();
              }
            }}
            label="Tener un día libre"
          />
        </div>
        <div className="flex items-center justify-between p-4 border-b border-gray/20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium">Vista previa de horarios</h2>
            {hasSubjects && hasSchedules && (
              <span className="text-sm text-gray">
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
        <div className="py-4">
          {!hasSubjects ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray rounded-lg">
              <div className="text-center text-gray mb-4">
                <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="mb-2 text-sm">
                  {!hasSubjects
                    ? "No hay materias seleccionadas"
                    : !hasAttemptedGeneration
                    ? "Clic para generar posibles combinaciones"
                    : "No hay combinaciones posibles. Intenta una nueva combinación"}
                </div>
              </div>

              {hasSubjects && !hasAttemptedGeneration && (
                <button
                  onClick={handleGenerateClick}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Generar Horarios</span>
                </button>
              )}
            </div>
          ) : currentSchedule ? (
            <>
              <div ref={scheduleRef}>
                <ScheduleGrid slots={currentSchedule.slots} />
              </div>

              {/* Schedule Info */}
              <div className="mt-4">{renderScheduleInfo(currentSchedule)}</div>
            </>
          ) : null}
        </div>
      </div>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveAsPDF={handleSaveAsPDF}
        onSaveAsImage={handleSaveAsImage}
        onExportToCalendar={handleExportToCalendar}
        onShareLink={handleShareLink}
      />
    </div>
  );
};
