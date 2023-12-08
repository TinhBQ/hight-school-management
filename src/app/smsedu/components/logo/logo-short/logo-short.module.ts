import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoShortComponent } from './logo-short.component';

@NgModule({
  declarations: [LogoShortComponent],
  imports: [FormsModule, CommonModule],
  exports: [LogoShortComponent],
})
export class LogoShortModule {}
