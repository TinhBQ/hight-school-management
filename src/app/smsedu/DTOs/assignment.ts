export interface IAssignment {
  id?: string;
  teacher?: string;
  teacherId?: string;
  subject?: string;
  subjectId?: string;
  class?: string;
  classId?: string;
  lessonPerWeek?: number;
  clusters?: number[];
  status?: string;
}
