import { 
  SchedulerOptions, 
  TimeBlock, 
  SchedulerSubject,
  PossibleSchedule,
  ScheduleSlot,
  CommissionSchedule,
  Commission 
} from "../types/scheduler";

export class Scheduler {
  private subjects: SchedulerSubject[];
  private options: SchedulerOptions;
  private blockedTimes: TimeBlock[];
  private possibleSchedules: PossibleSchedule[] = [];

  constructor(
    subjects: SchedulerSubject[],
    options: SchedulerOptions,
    blockedTimes: TimeBlock[] = []
  ) {
    this.subjects = subjects;
    this.options = options;
    this.blockedTimes = blockedTimes;
  }

  generateSchedules(): PossibleSchedule[] {
    this.possibleSchedules = [];
    this.backtrack([], 0);
    return this.possibleSchedules;
  }

  private backtrack(currentSchedule: ScheduleSlot[], subjectIndex: number) {
    if (subjectIndex === this.subjects.length) {
      if (this.isValidSchedule(currentSchedule)) {
        this.possibleSchedules.push(this.createSchedule(currentSchedule));
      }
      return;
    }

    const subject = this.subjects[subjectIndex];
    const commissions = this.getAvailableCommissions(subject);

    for (const commission of commissions) {
      const slots = this.createSlotsFromCommission(subject, commission);
      if (this.canAddSlots(currentSchedule, slots)) {
        this.backtrack([...currentSchedule, ...slots], subjectIndex + 1);
      }
    }
  }

  private getAvailableCommissions(subject: SchedulerSubject) {
    return subject.selectedCommission === 'any' 
      ? subject.commissions 
      : subject.commissions.filter(c => c.name === subject.selectedCommission);
  }

  private createSlotsFromCommission(subject: SchedulerSubject, commission: Commission): ScheduleSlot[] {
    return commission.schedule.map((slot: CommissionSchedule) => ({
      day: slot.day,
      timeFrom: slot.timeFrom,
      timeTo: slot.timeTo,
      subject: subject.name,
      subject_id: subject.subject_id,
      commission: commission.name,
      building: slot.building,
      classroom: slot.classroom
    }));
  }

  private canAddSlots(schedule: ScheduleSlot[], newSlots: ScheduleSlot[]): boolean {
    if (this.options.allowOverlap) return true;

    return newSlots.every(newSlot => 
      schedule.every(existingSlot => {
        if (existingSlot.day !== newSlot.day) return true;

        const newStart = this.timeToMinutes(newSlot.timeFrom);
        const newEnd = this.timeToMinutes(newSlot.timeTo);
        const existingStart = this.timeToMinutes(existingSlot.timeFrom);
        const existingEnd = this.timeToMinutes(existingSlot.timeTo);

        return newEnd <= existingStart || newStart >= existingEnd;
      })
    );
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isValidSchedule(schedule: ScheduleSlot[]): boolean {
    if (!this.checkBlockedTimes(schedule)) return false;
    if (this.options.avoidBuildingChange && !this.checkBuildingChanges(schedule)) return false;
    if (this.options.allowFreeDay && !this.hasFreeDayOption(schedule)) return false;
    return true;
  }

  private checkBlockedTimes(schedule: ScheduleSlot[]): boolean {
    return schedule.every(slot => 
      this.blockedTimes.every(blocked => {
        if (blocked.day !== slot.day) return true;

        const slotStart = this.timeToMinutes(slot.timeFrom);
        const slotEnd = this.timeToMinutes(slot.timeTo);
        const blockedStart = this.timeToMinutes(blocked.from);
        const blockedEnd = this.timeToMinutes(blocked.to);

        return slotEnd <= blockedStart || slotStart >= blockedEnd;
      })
    );
  }

  private checkBuildingChanges(schedule: ScheduleSlot[]): boolean {
    const daySchedules = schedule.reduce((acc, slot) => {
      if (!acc[slot.day]) acc[slot.day] = [];
      acc[slot.day].push(slot);
      return acc;
    }, {} as Record<string, ScheduleSlot[]>);

    return Object.values(daySchedules).every(daySlots => {
      daySlots.sort((a, b) => this.timeToMinutes(a.timeFrom) - this.timeToMinutes(b.timeFrom));
      
      for (let i = 1; i < daySlots.length; i++) {
        const prevSlot = daySlots[i - 1];
        const currSlot = daySlots[i];
        
        if (prevSlot.building !== currSlot.building) {
          const prevEnd = this.timeToMinutes(prevSlot.timeTo);
          const currStart = this.timeToMinutes(currSlot.timeFrom);
          if (currStart - prevEnd < 60) return false; // Less than 1 hour between classes
        }
      }
      return true;
    });
  }

  private hasFreeDayOption(schedule: ScheduleSlot[]): boolean {
    const workDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const usedDays = new Set(schedule.map(slot => slot.day));
    return workDays.some(day => !usedDays.has(day));
  }

  private createSchedule(slots: ScheduleSlot[]): PossibleSchedule {
    return {
      slots,
      hasOverlap: this.hasTimeOverlaps(slots),
      hasBuildingConflict: !this.checkBuildingChanges(slots),
      hasFreeDay: this.hasFreeDayOption(slots)
    };
  }

  private hasTimeOverlaps(slots: ScheduleSlot[]): boolean {
    const daySchedules = slots.reduce((acc, slot) => {
      if (!acc[slot.day]) acc[slot.day] = [];
      acc[slot.day].push(slot);
      return acc;
    }, {} as Record<string, ScheduleSlot[]>);

    return Object.values(daySchedules).some(daySlots => {
      daySlots.sort((a, b) => this.timeToMinutes(a.timeFrom) - this.timeToMinutes(b.timeFrom));
      
      for (let i = 1; i < daySlots.length; i++) {
        const prevEnd = this.timeToMinutes(daySlots[i - 1].timeTo);
        const currStart = this.timeToMinutes(daySlots[i].timeFrom);
        if (currStart < prevEnd) return true;
      }
      return false;
    });
  }
} 