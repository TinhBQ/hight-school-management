import { ITeacher } from './teacher';

export interface IDepartment {
  id?: string;
  name?: string;
  leader?: ITeacher;
  quantity?: number;
  status?: string;
}
