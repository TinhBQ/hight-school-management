import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleGradeComponent } from './schedule-grade.component';
import { ScheduleGradeRoutingModule } from './schedule-grade-routing.module';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../../Services/schedule.service';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableExportService } from 'src/app/smsedu/Services/table-export.service';

@NgModule({
  declarations: [ScheduleGradeComponent],
  imports: [
    CommonModule,
    ScheduleGradeRoutingModule,
    TableModule,
    DropdownModule,
    FormsModule,
    ButtonModule,
  ],
  providers: [ScheduleService, TableExportService],
})
export class ScheduleGradeModule {}
