import { paths } from 'src/app/helper/paths';
import type { INavBar } from 'src/app/layout/DTOs/INavBar';

export const navData: INavBar[] = [
  {
    icon: 'pi pi-user-edit',
    label: 'Giáo viên',
    routeLink: paths.smsedu.teacher.root,
    items: [
      {
        icon: 'pi pi-user-edit',
        label: 'Hồ sơ Giáo viên',
        routeLink: paths.smsedu.teacher.root,
      },
      {
        icon: 'pi pi-user-edit',
        label: 'Phân công Giảng dạy',
        routeLink: paths.smsedu.teacher.assignment,
      },
    ],
  },
  {
    icon: 'pi pi-th-large',
    label: 'Lớp học',
    routeLink: paths.smsedu.class,
  },
  {
    icon: 'pi pi-microsoft',
    label: 'Phòng ban',
    routeLink: paths.smsedu.department,
  },
  {
    icon: 'pi pi-calculator',
    label: 'Thời khóa biểu',
    routeLink: paths.smsedu.schedule.root,
    items: [
      {
        icon: 'pi pi-user-edit',
        label: 'Thời khóa biểu theo khối',
        routeLink: paths.smsedu.schedule.grade,
      },
      {
        icon: 'pi pi-user-edit',
        label: 'Thời khóa biểu theo lớp',
        routeLink: paths.smsedu.schedule.class,
      },
    ],
  },
];
