import { Subject } from "../hooks/useSubjects";

export interface SchedulerOptions {
  allowOverlap: boolean;
  allowUnlimitedOverlap: boolean;
  avoidBuildingChange: boolean;
  allowFreeDay: boolean;
}

export interface TimeBlock {
  day: string;
  from: string;
  to: string;
  label?: string;
}

export interface ScheduleSlot {
  day: string;
  dateFrom: Date;
  dateTo: Date;
  timeFrom: string;
  timeTo: string;
  subject: string;
  subject_id: string;
  commission: string;
  building: string;
  classroom: string;
}

export interface PossibleSchedule {
  slots: ScheduleSlot[];
  maxOverlap: number;
  hasBuildingConflict: boolean;
  hasFreeDay: boolean;
}

export interface SchedulerSubject extends Subject {
  selectedCommissions: string[];
}

export interface CommissionSchedule {
  day: string;
  time_from: string;
  time_to: string;
  building: string;
  classroom: string;
}

export interface Commission {
  name: string;
  schedule: CommissionSchedule[];
} 