import { Subject } from "../hooks/useSubjects";

export interface SchedulerOptions {
  allowOverlap: boolean;
  avoidBuildingChange: boolean;
  allowFreeDay: boolean;
}

export interface TimeBlock {
  day: string;    // "MONDAY", "TUESDAY", etc.
  from: string;   // "HH:mm:ss"
  to: string;     // "HH:mm:ss"
}

export interface ScheduleSlot {
  day: string;
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
  hasOverlap: boolean;
  hasBuildingConflict: boolean;
  hasFreeDay: boolean;
}

export interface SchedulerSubject extends Subject {
  selectedCommission: string;  // 'any' or specific commission id
}

export interface CommissionSchedule {
  day: string;
  timeFrom: string;
  timeTo: string;
  building: string;
  classroom: string;
}

export interface Commission {
  name: string;
  schedule: CommissionSchedule[];
} 