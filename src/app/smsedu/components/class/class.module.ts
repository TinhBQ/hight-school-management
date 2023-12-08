import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ClassService } from '../../Services/class.service';
import { ClassRoutingModule } from './class-routing.module';
import { ClassComponent } from './class.component';
import { CalendarModule } from 'primeng/calendar';
import { TeacherService } from '../../Services/teacher.service';
import { AuthService } from '../../Services/auth.service';
import { TableExportService } from '../../Services/table-export.service';

@NgModule({
  declarations: [ClassComponent],
  imports: [
    CommonModule,
    ClassRoutingModule,
    ToolbarModule,
    FileUploadModule,
    TableModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    AutoCompleteModule,
    InputNumberModule,
    InputMaskModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
  ],
  providers: [ClassService, TeacherService, AuthService, TableExportService],
})
export class ClassModule {}
