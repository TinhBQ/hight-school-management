import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScheduleClassComponent } from './schedule-class.component';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: ScheduleClassComponent }]),
  ],
  exports: [RouterModule],
})
export class ScheduleClassRoutingModule {}
