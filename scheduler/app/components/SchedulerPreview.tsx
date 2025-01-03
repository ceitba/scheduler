/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface CalendarEvent {
  url: string;
  title: string;
}

interface SchedulerPreviewProps {
  schedules: PossibleSchedule[];
  setSchedules: (schedules: PossibleSchedule[]) => void;
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
  setSchedules = () => {},
  hasSubjects,
}) => {
  const scheduler = Scheduler.getInstance();
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  // const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const [lastOptionsString, setLastOptionsString] = useState(
    JSON.stringify(scheduler.getOptions())
  );
  const [lastSubjectsString, setLastSubjectsString] = useState(
    JSON.stringify(scheduler.getSubjects())
  );
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [remainingCalendarUrls, setRemainingCalendarUrls] = useState<
    CalendarEvent[]
  >([]);
  const [isCalendarPanelOpen, setIsCalendarPanelOpen] = useState(false);

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
      // setHasAttemptedGeneration(false);
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
    return (
      (options.allowOverlap || !schedule.hasOverlap) &&
      (!options.allowFreeDay || schedule.hasFreeDay)
    );
  });

  // const handleGenerateClick = () => {
  //   setHasAttemptedGeneration(true);
  //   setCurrentScheduleIndex(0); // Reset index when generating new schedules
  //   onGenerateSchedules();
  // };

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
    const wrapper = document.createElement("div");
    wrapper.style.padding = "40px";
    wrapper.style.backgroundColor = "var(--background)";
    wrapper.style.width = "100%";
    wrapper.style.position = "absolute";
    wrapper.style.left = "0";
    wrapper.style.top = "0";

    // Clone and prepare the content
    const clone = element.cloneNode(true) as HTMLElement;

    // Force the clone to take up proper width
    clone.style.width = "1200px"; // Set a reasonable fixed width
    clone.style.minWidth = "1200px";
    clone.style.position = "relative";
    clone.style.margin = "0 auto";
    clone.style.display = "flex";
    clone.style.flexDirection = "column";

    // Ensure all child elements expand properly
    const childElements = clone.getElementsByTagName("*");
    Array.from(childElements).forEach((el: Element) => {
      if (el instanceof HTMLElement) {
        if (getComputedStyle(el).display === "flex") {
          el.style.width = "100%";
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
        backgroundColor: getComputedStyle(document.body)
          .getPropertyValue("--background")
          .trim(),
        windowWidth: 1300, // Match the clone width
        width: 1300,
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions for PDF (maintaining aspect ratio)
      const pdfWidth = 1400;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "l",
        unit: "px",
        format: [pdfWidth, pdfHeight],
        hotfixes: ["px_scaling"],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("horario.pdf");
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const handleSaveAsImage = async () => {
    if (!scheduleRef.current) return;

    const element = scheduleRef.current as HTMLElement;

    const wrapper = document.createElement("div");
    wrapper.style.padding = "40px";
    wrapper.style.backgroundColor = "var(--background)";
    wrapper.style.width = "100%";
    wrapper.style.position = "absolute";
    wrapper.style.left = "0";
    wrapper.style.top = "0";

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = "1200px";
    clone.style.minWidth = "1200px";
    clone.style.position = "relative";
    clone.style.margin = "0 auto";
    clone.style.display = "flex";
    clone.style.flexDirection = "column";

    const childElements = clone.getElementsByTagName("*");
    Array.from(childElements).forEach((el: Element) => {
      if (el instanceof HTMLElement) {
        if (getComputedStyle(el).display === "flex") {
          el.style.width = "100%";
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
        backgroundColor: getComputedStyle(document.body)
          .getPropertyValue("--background")
          .trim(),
        windowWidth: 1400,
        width: 1400,
      });

      const link = document.createElement("a");
      link.download = "horario.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const getNextDayDate = (dayName: string): Date => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = new Date();
    const dayIndex = days.indexOf(dayName.toLowerCase());

    const targetDate = new Date();
    const currentDay = today.getDay();

    let daysUntilTarget = dayIndex - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }

    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  };

  // Helper function to convert time string to Date
  const timeStringToDate = (timeStr: string, baseDate: Date): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };


  const generateIcsContent = (scheduleEvents: any[]) => {
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Schedule Generator//EN",
      "CALSCALE:GREGORIAN",
    ];

    scheduleEvents.forEach((event) => {
      const eventDate = getNextDayDate(event.day);
      const startDate = timeStringToDate(event.startTime, eventDate);
      const endDate = timeStringToDate(event.endTime, eventDate);

      const formatDate = (date: Date) => {
        return date
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      };

      icsContent = icsContent.concat([
        "BEGIN:VEVENT",
        `SUMMARY:${event.title}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        "RRULE:FREQ=WEEKLY",
        `LOCATION:${event.location}`,
        "END:VEVENT",
      ]);
    });

    icsContent.push("END:VCALENDAR");
    return icsContent.join("\r\n");
  };

  let scheduleEvents: any[] = [];

  const handleExportToCalendar = () => {
    if (!currentSchedule) return;
    setIsCalendarPanelOpen(true);

    // First group the events by course, day and time
    const groupedEvents = currentSchedule.slots.reduce((acc, slot) => {
      const key = `${slot.subject_id}-${slot.day}-${slot.timeFrom}-${slot.timeTo}`;

      if (!acc[key]) {
        acc[key] = {
          title: `${slot.subject_id} - ${slot.subject}`,
          day: slot.day.toLowerCase(),
          startTime: slot.timeFrom,
          endTime: slot.timeTo,
          locations: [slot.classroom || ""],
        };
      } else {
        if (!acc[key].locations.includes(slot.classroom)) {
          acc[key].locations.push(slot.classroom || "");
        }
      }

      return acc;
    }, {} as Record<string, any>);

    // Transform the grouped events into the final format
    scheduleEvents = Object.values(groupedEvents).map((event) => ({
      title: event.title,
      day: event.day,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.locations.join(", "),
    }));

    // Helper function to get the next occurrence of a weekday
    
    // Helper function to create Google Calendar URL
    const createGoogleCalendarUrl = (event: {
      title: string;
      day: string;
      startTime: string;
      endTime: string;
      location?: string;
    }): string => {
      const eventDate = getNextDayDate(event.day);
      const startDate = timeStringToDate(event.startTime, eventDate);
      const endDate = timeStringToDate(event.endTime, eventDate);

      // Format dates for Google Calendar
      const formatDate = (date: Date): string => {
        return date
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      };

      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
        recur: "RRULE:FREQ=WEEKLY",
        location: event.location || "",
      });

      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    // Create calendar URLs and open first one
    const calendarUrls = scheduleEvents.map((event) => ({
      url: createGoogleCalendarUrl(event),
      title: event.title,
    }));
    setRemainingCalendarUrls(calendarUrls);
  };

  const handleShareLink = () => {
    // TODO: Implement share link functionality
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("¡Enlace copiado al portapapeles!");
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
              setSchedules(scheduler.generateSchedules());
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
              setSchedules(scheduler.generateSchedules());
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
                    : "No hay combinaciones posibles. Intenta una nueva combinación"
                    }
                </div>
              </div>
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

      {isCalendarPanelOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background shadow-lg transform transition-transform border-l border-gray/20 overflow-y-auto z-10">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Agregar al calendario</h3>
              <button
                onClick={() => setIsCalendarPanelOpen(false)}
                className="p-2 hover:bg-secondaryBackground rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Batch Add Option */}
            <div className="mb-6 p-4 border border-gray/20 rounded-lg">
              <h4 className="font-medium mb-2">
                Opción 1: Agregar todos los eventos
              </h4>
              <p className="text-sm text-gray mb-4">
                Descarga el archivo y súbelo a Google Calendar para agregar
                todos los eventos a la vez.
              </p>
              <ol className="text-sm space-y-2 mb-4">
                <li>1. Descarga el archivo de calendario</li>
                <li>
                  2. Ve a{" "}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    className="text-primary"
                  >
                    Google Calendar
                  </a>
                </li>
                <li>3. Haz clic en el ícono de configuración ⚙️</li>
                <li>4. Selecciona &quot;Importar y exportar&quot;</li>
                <li>5. Sube el archivo descargado</li>
              </ol>
              <button
                onClick={() => {
                  const blob = new Blob([generateIcsContent(scheduleEvents)], {
                    type: "text/calendar",
                  });
                  const link = document.createElement("a");
                  link.href = window.URL.createObjectURL(blob);
                  link.download = "horario.ics";
                  link.click();
                }}
                className="w-full flex items-center justify-center gap-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Descargar archivo de calendario</span>
              </button>
            </div>

            {/* Individual Add Option */}
            <div className="p-4 border border-gray/20 rounded-lg">
              <h4 className="font-medium mb-2">
                Opción 2: Agregar eventos uno por uno
              </h4>
              <div className="space-y-2">
                {remainingCalendarUrls.map((event, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      window.open(event.url, "_blank");
                      setRemainingCalendarUrls((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-secondaryBackground rounded-lg text-left border border-gray/20"
                  >
                    <CalendarDaysIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{event.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
