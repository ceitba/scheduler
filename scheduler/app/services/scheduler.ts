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

  // State management methods
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
    // If no commission is selected or explicitly set to 'any', return all commissions
    if (!subject.selectedCommission || subject.selectedCommission === 'any') {
      return subject.commissions;
    }
    
    // Find the specific commission by name
    const selectedCommission = subject.commissions.find(c => c.name === subject.selectedCommission);
    
    // If found, return only that commission, otherwise return all commissions as fallback
    if (selectedCommission) {
      console.log(`Using specific commission ${selectedCommission.name} for subject ${subject.name}`);
      return [selectedCommission];
    } else {
      console.log(`Commission ${subject.selectedCommission} not found for subject ${subject.name}, using all commissions`);
      return subject.commissions;
    }
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
    if (this.options.allowOverlap) return true;

    // Check overlap with existing schedule slots
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

    // Check overlap with blocked times
    // const noBlockedOverlap = newSlots.every(newSlot =>
    //   this.blockedTimes.every(blockedTime => {
    //     if (blockedTime.day !== newSlot.day) return true;

    //     const newStart = this.timeToMinutes(newSlot.timeFrom);
    //     const newEnd = this.timeToMinutes(newSlot.timeTo);
    //     const blockedStart = this.timeToMinutes(blockedTime.from);
    //     const blockedEnd = this.timeToMinutes(blockedTime.to);

    //     return newEnd <= blockedStart || newStart >= blockedEnd;
    //   })
    // );

    // return noScheduleOverlap && noBlockedOverlap;
    // return noScheduleOverlap;

  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isValidSchedule(schedule: ScheduleSlot[]): boolean {
    // if (!this.checkBlockedTimes(schedule)) return false;
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
    // const workDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    // const usedDays = new Set(schedule.map(slot => slot.day));
    // return workDays.some(day => !usedDays.has(day));
    const workDays : string[] = [];
    schedule.forEach(slot => {
      if (!workDays.includes(slot.day))
        workDays.push(slot.day);
    })
    return !(workDays.includes('MONDAY') && workDays.includes('TUESDAY') && workDays.includes('WEDNESDAY') && workDays.includes('THURSDAY') && workDays.includes('FRIDAY'));
  }

  private createSchedule(slots: ScheduleSlot[]): PossibleSchedule {
    return {
      slots,
      hasOverlap: this.hasTimeOverlap(slots),
      hasBuildingConflict: !this.checkBuildingChanges(slots),
      hasFreeDay: this.hasFreeDayOption(slots)
    };
  }

  private hasTimeOverlap(slots: ScheduleSlot[]): boolean {
    // Group slots by day
    const slotsByDay = slots.reduce((acc, slot) => {
      if (!acc[slot.day]) {
        acc[slot.day] = [];
      }
      acc[slot.day].push(slot);
      return acc;
    }, {} as Record<string, ScheduleSlot[]>);

    // Check for overlaps within each day
    for (const daySlots of Object.values(slotsByDay)) {
      // Sort slots by start time
      daySlots.sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));

      // Check each pair of consecutive slots
      for (let i = 0; i < daySlots.length - 1; i++) {
        const currentSlot = daySlots[i];
        const nextSlot = daySlots[i + 1];

        // If the current slot ends after the next slot starts, there's an overlap
        // But only if they're from different subjects
        if (currentSlot.timeTo > nextSlot.timeFrom && currentSlot.subject_id !== nextSlot.subject_id) {
          return true;
        }
      }
    }

    return false;
  }
} 