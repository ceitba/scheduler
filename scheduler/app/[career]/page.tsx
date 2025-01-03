"use client";
import { redirect, useSearchParams, useParams } from "next/navigation";
import TabView from "../components/TabView";
import CourseView from "../components/CourseView";
import { SettingsView } from "../components/SettingsView";
import { SchedulerPreview } from "../components/SchedulerPreview";
import TopBar from "../components/Topbar";
import CommissionModal from "../components/CommissionModal";
import { Subject } from "../hooks/useSubjects";
import { useState, useEffect, useRef } from "react";
import { normalizePlanId, denormalizePlanId } from "../utils/planUtils";
import { Scheduler } from "../services/scheduler";
import { PossibleSchedule } from "../types/scheduler";
import { AVAILABLE_PLANS } from "../types/careers";
import { XMarkIcon, CalendarDaysIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface SelectedCourse extends Subject {
  selectedCommission: string;
  isPriority: boolean;
}

interface PageProps {
  params: Promise<{
    career: string;
  }>;
}

interface CalendarEvent {
  url: string;
  title: string;
}

interface GroupedEvent {
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  locations: string[];
}

const VALID_CAREERS = Object.keys(AVAILABLE_PLANS);

export default function CareerPage({ }: PageProps) {
  const { career } = useParams();
  const searchParams = useSearchParams();
  const normalizedPlan = searchParams.get("plan");
  const plan = normalizedPlan ? denormalizePlanId(normalizedPlan) : null;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] =
    useState<Subject | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [schedules, setSchedules] = useState<PossibleSchedule[]>([]);
  const scheduler = Scheduler.getInstance();
  const [isCalendarPanelOpen, setIsCalendarPanelOpen] = useState(false);
  const [remainingCalendarUrls, setRemainingCalendarUrls] = useState<CalendarEvent[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<PossibleSchedule | null>(null);
  const calendarPanelRef = useRef<HTMLDivElement>(null);

  // Initialize scheduler with state
  useEffect(() => {
    scheduler.setSubjects(selectedCourses);
  }, [selectedCourses, scheduler]);

  useEffect(() => {
    setSchedules(scheduler.getSchedules());
  }, [scheduler, setSchedules]);

  // Redirect to home if career code is invalid
  if (!VALID_CAREERS.includes(career as string)) {
    redirect("/");
  }

  // If no plan is specified or plan is invalid, redirect to the default plan
  const validPlans = AVAILABLE_PLANS[
    career as keyof typeof AVAILABLE_PLANS
  ].map((p) => normalizePlanId(p.id));

  if (!normalizedPlan || !validPlans.includes(normalizedPlan)) {
    const defaultPlan = normalizePlanId(
      AVAILABLE_PLANS[career as keyof typeof AVAILABLE_PLANS][0].id
    );
    redirect(`/${career}?plan=${defaultPlan}`);
  }

  const handleCommissionSelect = (commissionId: string) => {
    if (selectedCourseForModal) {
      const commission =
        commissionId === "any"
          ? { name: "any" }
          : selectedCourseForModal.commissions.find(
              (c) => c.name === commissionId
            );

      if (!commission) {
        console.error(
          `Commission ${commissionId} not found for course ${selectedCourseForModal.name}`
        );
        return;
      }

      const updatedCourses = [
        ...selectedCourses,
        {
          ...selectedCourseForModal,
          selectedCommission: commission.name,
          isPriority: false,
        },
      ];
      setSelectedCourses(updatedCourses);
      scheduler.setSubjects(updatedCourses);
    }
    setModalOpen(false);
    setSelectedCourseForModal(null);
  };

  const handleReorderCourses = (reorderedCourses: SelectedCourse[]) => {
    setSelectedCourses(reorderedCourses);
    scheduler.setSubjects(
      reorderedCourses.map((course) => ({
        ...course,
        selectedCommission:
          course.selectedCommission === "any"
            ? "any"
            : course.selectedCommission,
      }))
    );
  };

  const handleGenerateSchedules = () => {
    // Log scheduler state
    console.log("Generating schedules with the following configuration:");
    console.log(
      "Selected Courses:",
      selectedCourses.map((course) => ({
        name: course.name,
        selectedCommission: course.selectedCommission,
      }))
    );
    console.log("Scheduler Options:", scheduler.getOptions());
    console.log("Blocked Times:", scheduler.getBlockedTimes());

    const generatedSchedules = scheduler.generateSchedules();
    console.log("Generated Schedules:", generatedSchedules);
    setSchedules(generatedSchedules);
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

  const timeStringToDate = (timeStr: string, baseDate: Date): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  let scheduleEvents: any[] = [];

  const handleExportToCalendar = () => {
    if (!currentSchedule) return;
    setIsCalendarPanelOpen(true);

    // First group the events by course, day and time
    const groupedEvents = currentSchedule.slots.reduce<Record<string, GroupedEvent>>((acc, slot) => {
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
        if (!acc[key].locations.includes(slot.classroom || "")) {
          acc[key].locations.push(slot.classroom || "");
        }
      }

      return acc;
    }, {});

    // Transform the grouped events into the final format
    scheduleEvents = Object.values(groupedEvents).map((event: GroupedEvent) => ({
      title: event.title,
      day: event.day,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.locations.join(", "),
    }));

    // Create calendar URLs and open first one
    const calendarUrls = scheduleEvents.map((event) => ({
      url: createGoogleCalendarUrl(event),
      title: event.title,
    }));
    setRemainingCalendarUrls(calendarUrls);
  };

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

  const tabs = [
    {
      label: "Cursos",
      content: (
        <CourseView
          selectedCourses={selectedCourses}
          onCommissionSelect={(course) => {
            setSelectedCourseForModal(course);
            setModalOpen(true);
          }}
          onAddCourse={(course, commission) => {
            const updatedCourses = [
              ...selectedCourses,
              {
                ...course,
                selectedCommission: commission.name,
                isPriority: false,
              },
            ];
            setSelectedCourses(updatedCourses);
            scheduler.setSubjects(updatedCourses);
            setSchedules([]);
          }}
          onRemoveCourse={(courseId) => {
            const updatedCourses = selectedCourses.filter(
              (c) => c.subject_id !== courseId
            );
            setSelectedCourses(updatedCourses);
            scheduler.setSubjects(updatedCourses);
            setSchedules([]);
          }}
          onReorderCourses={handleReorderCourses}
        />
      ),
    },
    {
      label: "Adicionales",
      content: <SettingsView />,
    },
    {
      label: "Calendario",
      content: (
        <SchedulerPreview
          schedules={schedules}
          setSchedules={setSchedules}
          hasSubjects={selectedCourses.length > 0}
          onExportToCalendar={handleExportToCalendar}
        />
      ),
      onClick: handleGenerateSchedules
    },
  ];

  // Update currentSchedule when schedules change
  useEffect(() => {
    if (schedules.length > 0) {
      setCurrentSchedule(schedules[0]);
    } else {
      setCurrentSchedule(null);
    }
  }, [schedules]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarPanelRef.current && !calendarPanelRef.current.contains(event.target as Node)) {
        setIsCalendarPanelOpen(false);
      }
    };

    if (isCalendarPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarPanelOpen]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar currentPlan={plan || ""} />
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <TabView tabs={tabs} />
      </div>

      <CommissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleCommissionSelect}
        commission={selectedCourseForModal?.commissions || []}
        courseName={selectedCourseForModal?.name || ""}
        courseId={selectedCourseForModal?.subject_id || ""}
      />

      {isCalendarPanelOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[100]" />
          
          {/* Panel */}
          <div ref={calendarPanelRef} className="fixed inset-y-0 right-0 w-full sm:w-[28rem] bg-background transform transition-transform border-l border-gray/20 overflow-y-auto z-[101] shadow-xl">
            <div className="p-3 sm:p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-medium">Agregar al calendario</h3>
                <button
                  onClick={() => setIsCalendarPanelOpen(false)}
                  className="p-2 hover:bg-secondaryBackground rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Batch Add Option */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-gray/20 rounded-lg">
                <h4 className="text-sm sm:text-base font-medium mb-2">
                  Opción 1: Agregar todos los eventos
                </h4>
                <p className="text-xs sm:text-sm text-gray mb-3 sm:mb-4">
                  Descarga el archivo y súbelo a Google Calendar para agregar
                  todos los eventos a la vez.
                </p>
                <ol className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 mb-4">
                  <li>1. Descarga el archivo de calendario</li>
                  <li>
                    2. Ve a{" "}
                    <a href="https://calendar.google.com"
                      target="_blank"
                      className="text-primary"
                    >
                      Google Calendar
                    </a>
                  </li>
                  <li>3. Haz clic en el ícono de configuración ⚙️</li>
                  <li>4. Selecciona "Importar y exportar"</li>
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm sm:text-base"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Descargar archivo de calendario</span>
                </button>
              </div>

              {/* Individual Add Option */}
              <div className="p-3 sm:p-4 border border-gray/20 rounded-lg">
                <h4 className="text-sm sm:text-base font-medium mb-2">
                  Opción 2: Agregar eventos uno por uno
                </h4>
                <div className="space-y-1.5 sm:space-y-2">
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
                      <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm line-clamp-2">{event.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
