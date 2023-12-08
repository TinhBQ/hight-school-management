import { IPeriod } from './period';

export interface ISchedule {
  classId?: string;
  className?: string;
  numberOfPeriods?: number;
  periods?: IPeriod[];
}
