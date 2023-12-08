import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error.component';
import { ErrorRoutingModule } from './error-routing.module';
import { ButtonModule } from 'primeng/button';
import { LogoMainModule } from '../../logo/logo-main/logo-main.module';

@NgModule({
  declarations: [ErrorComponent],
  imports: [CommonModule, ErrorRoutingModule, ButtonModule, LogoMainModule],
})
export class ErrorModule {}
