import { ITeacher } from './teacher';

export interface IProfile {
  id?: string;
  username?: string;
  role?: string;
  status: string;
  teacher: ITeacher;
}
