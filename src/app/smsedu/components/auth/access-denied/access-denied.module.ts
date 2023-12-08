import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { LogoMainModule } from '../../logo/logo-main/logo-main.module';
import { AccessDeniedComponent } from './access-denied.component';
import { AccessDeniedRoutingModule } from './access-denied-routing.module';

@NgModule({
  declarations: [AccessDeniedComponent],
  imports: [
    CommonModule,
    AccessDeniedRoutingModule,
    ButtonModule,
    LogoMainModule,
  ],
})
export class AccessDeniedModule {}
