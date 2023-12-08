export interface IPeriod {
  id: string;
  teacherId: string;
  teacherShortName: string;
  subjectId: string;
  subjectShortName: string;
  classId: string;
  className: string;
  cluster: number;
  startAtPeriod: number;
  numberOfPeriods: number;
  piority: number;
  isAssigned: boolean;
}
