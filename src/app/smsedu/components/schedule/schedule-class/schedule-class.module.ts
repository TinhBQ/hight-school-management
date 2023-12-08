import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleClassComponent } from './schedule-class.component';
import { ScheduleClassRoutingModule } from './schedule-class-routing.module';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../../Services/schedule.service';
import { ButtonModule } from 'primeng/button';
import { TableExportService } from 'src/app/smsedu/Services/table-export.service';

@NgModule({
  declarations: [ScheduleClassComponent],
  imports: [
    CommonModule,
    ScheduleClassRoutingModule,
    TableModule,
    AutoCompleteModule,
    FormsModule,
    ButtonModule,
  ],
  providers: [ScheduleService, TableExportService],
})
export class ScheduleClassModule {}
