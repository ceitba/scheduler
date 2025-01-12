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
  private static instance: Scheduler;
  private subjects: SchedulerSubject[] = [];
  private options: SchedulerOptions = {
    allowOverlap: false,
    allowUnlimitedOverlap: false,
    avoidBuildingChange: false,
    allowFreeDay: false
  };
  private blockedTimes: TimeBlock[] = [];
  private possibleSchedules: PossibleSchedule[] = [];

  private constructor() {}

  public static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler();
    }
    return Scheduler.instance;
  }

  public setSubjects(subjects: SchedulerSubject[]): void {
    this.subjects = subjects;
  }

  public getSubjects(): SchedulerSubject[] {
    return this.subjects;
  }

  public setOptions(options: SchedulerOptions): void {
    this.options = options;
  }

  public getOptions(): SchedulerOptions {
    return this.options;
  }

  public setBlockedTimes(blockedTimes: TimeBlock[]): void {
    this.blockedTimes = blockedTimes;
  }

  public getBlockedTimes(): TimeBlock[] {
    return this.blockedTimes;
  }

  public getSchedules(): PossibleSchedule[] {
    return this.possibleSchedules;
  }

  public generateSchedules(): PossibleSchedule[] {
    this.possibleSchedules = [];
    this.backtrack([], 0);
    
    if (this.options.allowOverlap && !this.options.allowUnlimitedOverlap) {
      this.possibleSchedules = this.possibleSchedules.filter(schedule => 
        schedule.maxOverlap <= 30
      );
    }
    
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
    if (!subject.selectedCommissions || subject.selectedCommissions.includes('any')) {
      return subject.commissions;
    }
    
    const selectedCommissions = subject.commissions.filter(c => 
      subject.selectedCommissions.includes(c.name)
    );
    
    return selectedCommissions.length > 0 ? selectedCommissions : subject.commissions;
  }

  private createSlotsFromCommission(subject: SchedulerSubject, commission: Commission): ScheduleSlot[] {
    return commission.schedule.map((slot: CommissionSchedule) => ({
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
  }

  private canAddSlots(schedule: ScheduleSlot[], newSlots: ScheduleSlot[]): boolean {
    if (this.options.allowUnlimitedOverlap) return true;
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
    if (this.options.avoidBuildingChange && !this.checkBuildingChanges(schedule)) return false;
    if (this.options.allowFreeDay && !this.hasFreeDayOption(schedule)) return false;
    return true;
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
          if (currStart - prevEnd < 60) return false;
        }
      }
      return true;
    });
  }

  private hasFreeDayOption(schedule: ScheduleSlot[]): boolean {
    const workDays: string[] = [];
    schedule.forEach(slot => {
      if (!workDays.includes(slot.day)) {
        workDays.push(slot.day);
      }
    });
    return !(
      workDays.includes('MONDAY') && 
      workDays.includes('TUESDAY') && 
      workDays.includes('WEDNESDAY') && 
      workDays.includes('THURSDAY') && 
      workDays.includes('FRIDAY')
    );
  }

  private createSchedule(slots: ScheduleSlot[]): PossibleSchedule {
    return {
      slots,
      maxOverlap: this.getMaxTimeOverlap(slots),
      hasBuildingConflict: !this.checkBuildingChanges(slots),
      hasFreeDay: this.hasFreeDayOption(slots)
    };
  }

  private getMaxTimeOverlap(slots: ScheduleSlot[]): number {
    let maxOverlap = 0;
    const slotsByDay = slots.reduce((acc, slot) => {
      if (!acc[slot.day]) {
        acc[slot.day] = [];
      }
      acc[slot.day].push(slot);
      return acc;
    }, {} as Record<string, ScheduleSlot[]>);

    for (const daySlots of Object.values(slotsByDay)) {
      daySlots.sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));

      for (let i = 0; i < daySlots.length - 1; i++) {
        const currentSlot = daySlots[i];
        const nextSlot = daySlots[i + 1];

        if (currentSlot.timeTo > nextSlot.timeFrom && currentSlot.subject_id !== nextSlot.subject_id) {
          const overlap = this.calculateOverlap(currentSlot, nextSlot);
          maxOverlap = Math.max(maxOverlap, overlap);
        }
      }
    }
    return maxOverlap;
  }

  private calculateOverlap(slot1: ScheduleSlot, slot2: ScheduleSlot): number {
    const end = new Date(`1970-01-01T${slot1.timeTo}Z`).getTime();
    const start = new Date(`1970-01-01T${slot2.timeFrom}Z`).getTime();
    return (end - start) / 60000;
  }
}
