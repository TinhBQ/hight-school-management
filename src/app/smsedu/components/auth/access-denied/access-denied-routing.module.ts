import { NgModule } from '@angular/core';
import { AccessDeniedComponent } from './access-denied.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: AccessDeniedComponent }]),
  ],
  exports: [RouterModule],
})
export class AccessDeniedRoutingModule {}
