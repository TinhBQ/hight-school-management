import { NgModule } from '@angular/core';
import { LogoMainComponent } from './logo-main.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [LogoMainComponent],
  imports: [FormsModule, CommonModule],
  exports: [LogoMainComponent],
})
export class LogoMainModule {}
