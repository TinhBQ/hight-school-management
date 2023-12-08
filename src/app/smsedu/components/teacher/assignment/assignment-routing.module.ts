import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AssignmentComponent } from './assignment.component';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: AssignmentComponent }]),
  ],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {}
