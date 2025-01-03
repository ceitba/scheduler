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
  label?: string; // Optional label for the block
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
  maxOverlap: number;
  hasBuildingConflict: boolean;
  hasFreeDay: boolean;
}

export interface SchedulerSubject extends Subject {
  selectedCommission: string;  // 'any' or specific commission id
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