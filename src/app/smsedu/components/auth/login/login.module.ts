import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { LoginRoutingModule } from './login-routing.module';
import { LogoMainModule } from '../../logo/logo-main/logo-main.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../Services/auth.service';
import { BlockUIModule } from 'primeng/blockui';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    LoginRoutingModule,
    LogoMainModule,
    BlockUIModule,
  ],
  providers: [AuthService],
  exports: [LoginComponent],
})
export class LoginModule {}
