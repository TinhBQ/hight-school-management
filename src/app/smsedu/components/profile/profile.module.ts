import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../Services/auth.service';
import { ProfileService } from '../../Services/profile.service';
import { ProfileComponent } from './profile.component';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
  ],
  providers: [ProfileService, AuthService],
  exports: [ProfileComponent],
})
export class ProfileModule {}
