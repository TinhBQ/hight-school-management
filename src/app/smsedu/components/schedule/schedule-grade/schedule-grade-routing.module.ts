import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScheduleGradeComponent } from './schedule-grade.component';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: ScheduleGradeComponent }]),
  ],
  exports: [RouterModule],
})
export class ScheduleGradeRoutingModule {}
