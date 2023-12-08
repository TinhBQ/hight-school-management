import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { authGuard } from './smsedu/components/auth/auth.guard';
import { paths } from './helper/paths';

const routes: Routes = [
  {
    path: '',
    redirectTo: paths.auth.login,
    pathMatch: 'full',
  },
  {
    path: 'smsedu',
    component: AppLayoutComponent,
    children: [
      {
        path: 'teacher',
        loadChildren: () =>
          import('./smsedu/components/teacher/teacher.module').then(
            m => m.TeacherModule
          ),
      },
      {
        path: 'class',
        loadChildren: () =>
          import('./smsedu/components/class/class.module').then(
            m => m.ClassModule
          ),
      },
      {
        path: 'department',
        loadChildren: () =>
          import('./smsedu/components/department/department.module').then(
            m => m.DepartmentModule
          ),
      },
      {
        path: 'schedule',
        loadChildren: () =>
          import('./smsedu/components/schedule/schedule.module').then(
            m => m.ScheduleModule
          ),
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./smsedu/components/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'not-found',
    loadChildren: () =>
      import('./smsedu/components/not-found/not-found.module').then(
        m => m.NotFoundModule
      ),
  },
  { path: '**', redirectTo: paths.notFound, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
