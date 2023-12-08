import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { paths } from 'src/app/helper/paths';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'class',
        loadChildren: () =>
          import('./schedule-class/schedule-class.module').then(
            m => m.ScheduleClassModule
          ),
      },
      {
        path: 'grade',
        loadChildren: () =>
          import('./schedule-grade/schedule-grade.module').then(
            m => m.ScheduleGradeModule
          ),
      },
      { path: '**', redirectTo: paths.notFound },
    ]),
  ],
  exports: [RouterModule],
})
export class ScheduleRoutingModule {}
