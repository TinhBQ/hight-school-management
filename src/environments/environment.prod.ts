export const environment = {
  production: true,
  baseUrl: 'http://hsms-api-dev.ap-southeast-1.elasticbeanstalk.com/',
  endpoint: {
    auth: {
      root: 'auth',
      login: 'auth/login',
      refreshToken: 'auth/refresh-token',
      logout: 'auth/logout',
    },
    assignments: {
      root: 'assignments',
      getById: 'assignments/id',
      deleteItem: 'assignments/deletion',
    },
    teachers: {
      root: 'teachers',
      getById: 'teachers/id',
      deleteItem: 'teachers/delete-item',
    },
    classes: {
      root: 'classes',
      getById: 'classes/id',
      deleteItem: 'classes/deletion',
    },
    subjects: {
      root: 'subjects',
      getById: 'subjects/id',
    },
    departments: {
      root: 'departments',
      getById: 'departments/id',
      deleteItem: 'departments/deletion',
    },
    timetables: {
      root: 'timetables',
    },
    profiles: {
      root: 'profiles',
    },
  },
};
