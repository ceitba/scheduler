import React, { useState, useEffect, useRef } from "react";
import { PossibleSchedule } from "../types/scheduler";
import ScheduleGrid from "./ScheduleGrid";
import { Scheduler } from "../services/scheduler";
import {
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Checkbox from "./Checkbox";

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
    return options.allowOverlap || !schedule.hasOverlap;
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
      <div className="flex flex-wrap gap-4 text-sm text-gray">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              schedule.hasOverlap ? "bg-red-500" : "bg-green-500"
            }`}
          />
          <span>
            {schedule.hasOverlap ? "Tiene superposición" : "Sin superposición"}
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
              schedule.hasFreeDay ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <span>
            {schedule.hasFreeDay ? "Tiene día libre" : "Sin día libre"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-background rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-end px-4">
          <Checkbox
            id="allowOverlap"
            checked={settings.allowTimeOverlap}
            onChange={(checked) => {
              setSettings((prev) => ({ ...prev, allowTimeOverlap: checked }));
              // Update scheduler options immediately
              scheduler.setOptions({
                ...scheduler.getOptions(),
                allowOverlap: checked,
              });
              // Regenerate if we've already generated once
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
              // Update scheduler options immediately
              scheduler.setOptions({
                ...scheduler.getOptions(),
                allowFreeDay: checked,
              });
              // Regenerate if we've already generated once
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
            {hasSchedules && (
              <span className="text-sm text-gray">
                Opción {currentScheduleIndex + 1} de {filteredSchedules.length}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {hasSchedules && (
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
                {/* <button
                  onClick={onGenerateSchedules}
                  className="p-2 text-gray hover:bg-secondaryBackground rounded-lg"
                  title="Actualizar horarios"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button> */}
              </>
            )}
          </div>
        </div>
        <div className="p-4">
          {!hasSchedules ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray rounded-lg">
              <div className="text-center text-gray mb-4">
                <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="mb-2">
                  {!hasSubjects
                    ? "No hay materias seleccionadas"
                    : !hasAttemptedGeneration
                    ? "Clic para generar posibles combinaciones"
                    : "No hay combinaciones posibles. Intenta una nueva combinación"}
                </p>
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
              <ScheduleGrid slots={currentSchedule.slots} />

              {/* Schedule Info */}
              <div className="mt-4">{renderScheduleInfo(currentSchedule)}</div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
