import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeacherComponent } from './teacher.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: TeacherComponent },
      {
        path: 'assignment',
        loadChildren: () =>
          import('./assignment/assignment.module').then(
            m => m.AssignmentModule
          ),
      },
    ]),
  ],
  exports: [RouterModule],
})
export class TeacherRoutingModule {}
