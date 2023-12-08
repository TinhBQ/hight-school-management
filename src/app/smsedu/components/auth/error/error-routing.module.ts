import { NgModule } from '@angular/core';
import { ErrorComponent } from './error.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [RouterModule.forChild([{ path: '', component: ErrorComponent }])],
  exports: [RouterModule],
})
export class ErrorRoutingModule {}
