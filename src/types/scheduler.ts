import type { Subject } from "../hooks/useSubjects";

export interface SchedulerOptions {
  allowOverlap: boolean;
  allowUnlimitedOverlap: boolean;
  allowFreeDay: boolean;
}

// A period the user doesn't want classes in, drawn in the settings tab.
// day is MONDAY..FRIDAY; from/to are "HH:mm".
export interface TimeBlock {
  id?: string;
  day: string;
  from: string;
  to: string;
  label?: string;
}

export interface ScheduleSlot {
  day: string;
  dateFrom: string;
  dateTo: string;
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
  freeDays: number;
  gapMinutes: number;
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

export type CorrectionStatus = "PENDING" | "APPLIED" | "REJECTED" | "RESOLVED" | "SUPERSEDED";
export type VoteType = "CONFIRM" | "REJECT";

// A student-suggested schedule for a commission, as embedded in the
// subjects catalog (snake_case like the rest of that response). The catalog
// only carries PENDING and APPLIED ones, APPLIED first, then by confirms.
export interface CommissionCorrection {
  id: string;
  status: CorrectionStatus;
  schedule: CommissionSchedule[];
  // Distinct students; the suggester counts as a confirm.
  confirms: number;
  rejects: number;
  // The caller's vote; always null for anonymous visitors.
  my_vote: VoteType | null;
  created_at: string;
}

export interface Commission {
  name: string;
  // The ITBA commission id, needed to suggest a correction. Optional so the
  // app keeps working against an API that doesn't send it yet.
  commission_id?: string;
  // EFFECTIVE slots: the applied correction's slots if any, else SGA's.
  schedule: CommissionSchedule[];
  // Original SGA slots, present only while a correction is applied.
  sga_schedule?: CommissionSchedule[];
  corrections?: CommissionCorrection[];
}
