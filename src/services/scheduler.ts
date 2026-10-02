import {
  SchedulerOptions,
  TimeBlock,
  SchedulerSubject,
  PossibleSchedule,
  ScheduleSlot,
  CommissionSchedule,
  Commission
} from "../types/scheduler";
import { DayInterval, WEEKDAYS, overlapMinutes, timeToMinutes } from "./time";

// Hard cap on how many combinations one generation returns. Beyond this the
// UI shows a "showing the first N" notice instead of freezing the tab.
export const MAX_GENERATED_SCHEDULES = 500;
// Upper bound on search nodes visited, so a large selection with
// constraints that reject almost everything can't run unbounded (it runs in
// a Web Worker, see src/workers/, but slow phones still pay for every step).
export const MAX_SEARCH_STEPS = 1_000_000;
// "Limited overlap": two classes may share at most this many minutes.
export const LIMITED_OVERLAP_MINUTES = 30;

export const DEFAULT_SCHEDULER_OPTIONS: SchedulerOptions = {
  allowOverlap: false,
  allowUnlimitedOverlap: false,
  allowFreeDay: false
};

export interface GenerationResult {
  schedules: PossibleSchedule[];
  // True when the result cap or the search budget cut the search short.
  truncated: boolean;
  // True when it was the search budget (MAX_SEARCH_STEPS) that stopped it,
  // as opposed to having found MAX_GENERATED_SCHEDULES results.
  stepLimitReached: boolean;
}

interface GenerationLimits {
  maxResults?: number;
  maxSteps?: number;
}

const slotInterval = (slot: ScheduleSlot): DayInterval => ({
  day: slot.day,
  from: timeToMinutes(slot.timeFrom),
  to: timeToMinutes(slot.timeTo)
});

const blockInterval = (block: TimeBlock): DayInterval => ({
  day: block.day,
  from: timeToMinutes(block.from),
  to: timeToMinutes(block.to)
});

export const intersectsBlockedTime = (slot: ScheduleSlot, blockedTimes: TimeBlock[]): boolean => {
  const s = slotInterval(slot);
  return blockedTimes.some(block => overlapMinutes(s, blockInterval(block)) > 0);
};

const getAvailableCommissions = (subject: SchedulerSubject): Commission[] => {
  if (!subject.selectedCommissions || subject.selectedCommissions.includes('any')) {
    return subject.commissions;
  }
  const selected = subject.commissions.filter(c => subject.selectedCommissions.includes(c.name));
  return selected.length > 0 ? selected : subject.commissions;
};

const createSlotsFromCommission = (subject: SchedulerSubject, commission: Commission): ScheduleSlot[] =>
  commission.schedule.map((slot: CommissionSchedule) => ({
    day: slot.day,
    timeFrom: slot.time_from,
    timeTo: slot.time_to,
    subject: subject.name,
    dateFrom: subject.course_start,
    dateTo: subject.course_end,
    subject_id: subject.subject_id,
    commission: commission.name,
    building: slot.building,
    classroom: slot.classroom
  }));

// Largest number of minutes any two classes of different subjects share on
// the same day. Compares every pair (not just neighbours after sorting), so
// A 08-13, B 09-09:30, C 10-13 reports 180 (A vs C), not 30.
export const getMaxTimeOverlap = (slots: ScheduleSlot[]): number => {
  let max = 0;
  const intervals = slots.map(slotInterval);
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].subject_id === slots[j].subject_id) continue;
      max = Math.max(max, overlapMinutes(intervals[i], intervals[j]));
    }
  }
  return max;
};

export const countFreeWeekdays = (slots: ScheduleSlot[]): number =>
  WEEKDAYS.filter(day => !slots.some(slot => slot.day === day)).length;

// Idle minutes between classes on the same day, summed over the week.
export const getGapMinutes = (slots: ScheduleSlot[]): number => {
  const byDay = new Map<string, DayInterval[]>();
  slots.forEach(slot => {
    const list = byDay.get(slot.day) ?? [];
    list.push(slotInterval(slot));
    byDay.set(slot.day, list);
  });
  let gaps = 0;
  byDay.forEach(intervals => {
    intervals.sort((a, b) => a.from - b.from);
    let end = intervals[0].to;
    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i].from > end) gaps += intervals[i].from - end;
      end = Math.max(end, intervals[i].to);
    }
  });
  return gaps;
};

// False when, on some day, a class in one building is followed by a class
// in another building with less than an hour in between.
export const checkBuildingChanges = (slots: ScheduleSlot[]): boolean => {
  const byDay = new Map<string, ScheduleSlot[]>();
  slots.forEach(slot => byDay.set(slot.day, [...(byDay.get(slot.day) ?? []), slot]));
  return Array.from(byDay.values()).every(daySlots => {
    const sorted = [...daySlots].sort((a, b) => timeToMinutes(a.timeFrom) - timeToMinutes(b.timeFrom));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].building !== sorted[i].building &&
        timeToMinutes(sorted[i].timeFrom) - timeToMinutes(sorted[i - 1].timeTo) < 60) {
        return false;
      }
    }
    return true;
  });
};

export const createSchedule = (slots: ScheduleSlot[]): PossibleSchedule => {
  const freeDays = countFreeWeekdays(slots);
  return {
    slots,
    maxOverlap: getMaxTimeOverlap(slots),
    hasBuildingConflict: !checkBuildingChanges(slots),
    hasFreeDay: freeDays > 0,
    freeDays,
    gapMinutes: getGapMinutes(slots)
  };
};

// Best first: least overlap, then most free weekdays, then fewest idle
// minutes between classes. Ties keep generation order (stable sort).
export const rankSchedules = (schedules: PossibleSchedule[]): PossibleSchedule[] =>
  schedules
    .map((schedule, index) => ({ schedule, index }))
    .sort((a, b) =>
      a.schedule.maxOverlap - b.schedule.maxOverlap ||
      b.schedule.freeDays - a.schedule.freeDays ||
      a.schedule.gapMinutes - b.schedule.gapMinutes ||
      a.index - b.index
    )
    .map(({ schedule }) => schedule);

// Builds every combination of one commission per subject that satisfies the
// options and avoids the blocked times. Constraints are applied while
// backtracking (not after), so rejected branches are never expanded.
// Pure and DOM-free: the app runs it inside src/workers/scheduler.worker.ts,
// and useScheduleGeneration falls back to calling it directly.
export function generateSchedules(
  subjects: SchedulerSubject[],
  options: SchedulerOptions,
  blockedTimes: TimeBlock[],
  limits: GenerationLimits = {}
): GenerationResult {
  const maxResults = limits.maxResults ?? MAX_GENERATED_SCHEDULES;
  const maxSteps = limits.maxSteps ?? MAX_SEARCH_STEPS;
  if (subjects.length === 0) return { schedules: [], truncated: false, stepLimitReached: false };

  const maxPairOverlap = options.allowUnlimitedOverlap
    ? Infinity
    : options.allowOverlap ? LIMITED_OVERLAP_MINUTES : 0;

  // Commissions that hit a blocked time can never be part of a result.
  const candidates = subjects.map(subject =>
    getAvailableCommissions(subject)
      .map(commission => createSlotsFromCommission(subject, commission))
      .filter(slots => !slots.some(slot => intersectsBlockedTime(slot, blockedTimes)))
      .map(slots => ({ slots, intervals: slots.map(slotInterval) }))
  );
  if (candidates.some(list => list.length === 0)) return { schedules: [], truncated: false, stepLimitReached: false };

  const found: PossibleSchedule[] = [];
  const chosen: { slots: ScheduleSlot[]; intervals: DayInterval[] }[] = [];
  let steps = 0;
  let truncated = false;
  let stepLimitReached = false;

  const fits = (option: { intervals: DayInterval[] }): boolean => {
    if (maxPairOverlap !== Infinity) {
      for (const previous of chosen) {
        for (const a of option.intervals) {
          for (const b of previous.intervals) {
            if (overlapMinutes(a, b) > maxPairOverlap) return false;
          }
        }
      }
    }
    if (options.allowFreeDay) {
      const used = new Set<string>();
      chosen.forEach(c => c.intervals.forEach(i => used.add(i.day)));
      option.intervals.forEach(i => used.add(i.day));
      if (WEEKDAYS.every(day => used.has(day))) return false;
    }
    return true;
  };

  const backtrack = (index: number): void => {
    if (truncated) return;
    if (++steps > maxSteps) { truncated = true; stepLimitReached = true; return; }
    if (index === candidates.length) {
      found.push(createSchedule(chosen.flatMap(c => c.slots)));
      if (found.length >= maxResults) truncated = true;
      return;
    }
    for (const option of candidates[index]) {
      if (truncated) return;
      if (!fits(option)) continue;
      chosen.push(option);
      backtrack(index + 1);
      chosen.pop();
    }
  };

  backtrack(0);
  return { schedules: rankSchedules(found), truncated, stepLimitReached };
}
