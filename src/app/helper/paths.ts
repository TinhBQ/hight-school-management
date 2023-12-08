export const paths = {
  auth: {
    login: '/auth/login',
    error: '/auth/error',
    accessDenied: '/auth/access-denied',
  },
  smsedu: {
    teacher: {
      root: '/smsedu/teacher',
      assignment: '/smsedu/teacher/assignment',
    },
    class: '/smsedu/class',
    department: '/smsedu/department',
    schedules: '/smsedu/schedule',
    schedule: {
      root: '/smsedu/schedule',
      grade: '/smsedu/schedule/grade',
      class: '/smsedu/schedule/class',
    },
  },
  notFound: '/not-found',
};
