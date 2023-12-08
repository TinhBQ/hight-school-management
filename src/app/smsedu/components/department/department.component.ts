/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Table } from 'primeng/table';
import { Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { IDepartment } from '../../DTOs/department';
import { IColumn, IStatus } from '../../DTOs/helper';
import { ITeacher } from '../../DTOs/teacher';
import { DepartmentService } from '../../Services/department.service';
import { TeacherService } from '../../Services/teacher.service';
import { TableExportService } from '../../Services/table-export.service';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
})
export class DepartmentComponent implements OnInit {
  departments: IDepartment[];
  department: IDepartment;
  handleDepartments: IDepartment[];
  selectedDepartments!: IDepartment[];
  exportedDepartments!: IDepartment[];
  teachers: ITeacher[];
  teacher: ITeacher;
  filteredTeachers!: ITeacher[];
  cols!: IColumn[];
  statuses: IStatus[];
  loading = false;
  totalRecords!: number;
  isFirstLoadDialog = true;
  departmentDialog = false;
  deleteDeparmentDialog = false;
  deleteSelectedDepartmentsDialog = false;
  searchDepartment = '';
  searchText$ = new Subject<string>();
  params: object = { page: 1, size: 10 };

  departmentForm: FormGroup = this.fb.group({
    id: [''],
    name: ['', Validators.compose([Validators.required])],
    leader: ['', Validators.compose([Validators.required])],
    quantity: ['', Validators.compose([Validators.required])],
  });

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private departmentService: DepartmentService,
    private teacherService: TeacherService,
    private tableExportService: TableExportService
  ) {}

  @ViewChild('dt', {}) tableEL: Table;

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(packageName =>
        this.getDepartments({ ...this.params, search: packageName })
      );

    this.cols = [
      { field: 'name', header: 'Tên Phòng ban' },
      { field: 'leader', header: 'Trưởng Phòng ban' },
      { field: 'quantity', header: 'Số lượng' },
      { field: 'status', header: 'Trạng thái' },
    ];

    this.statuses = [
      { label: 'Kích hoạt', value: 'activate' },
      { label: 'Không kích hoạt', value: 'inactivate' },
      { label: 'Đã xóa', value: 'deleted' },
    ];
  }

  onLoadDepartments(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    this.params = { page: 1, size: rows };
    const _params = (!!sortField && {
      page: first / rows + 1,
      size: rows,
      sort: sortField,
      sortOrder: sortOrder === 1 ? '' : 'desc',
    }) || {
      page: first / rows + 1,
      size: rows,
    };

    this.getDepartments(_params);
  }

  getDepartments(params: object): void {
    this.loading = true;
    this.departmentService.getDepartments(params).subscribe(
      response => {
        this.departments = response.data;
        this.totalRecords = response.itemCount;
        this.loading = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  clear() {
    this.tableEL.clear();
    this.searchDepartment = '';
  }

  // * --------------------- Handle Search --------------------
  getSearchValue(event: Event): string {
    this.searchDepartment = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }

  onSearch(packageName: string) {
    this.searchText$.next(packageName);
  }

  onLoadDepartment(id: string): void {
    this.departmentService.getDepartment(id).subscribe(
      response => {
        const { id, name, leader, quantity } = response.data;
        this.departmentForm.setValue({
          id,
          name,
          leader,
          quantity,
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  onInitDepartmentData(): Observable<any> {
    return Observable.create(observer => {
      this.teacherService.getTeachers().subscribe(
        response => {
          this.teachers = response.data;
          observer.next(response);
          observer.complete();
        },
        error => {
          console.log(error);
        }
      );
    });
  }

  openEdit(id: string) {
    if (this.isFirstLoadDialog) {
      this.onInitDepartmentData().subscribe(() => {
        this.onLoadDepartment(id);
        this.isFirstLoadDialog = false;
        this.departmentDialog = true;
      });
    } else {
      this.onLoadDepartment(id);
      this.departmentDialog = true;
    }
  }

  onFliterTeacher(event: AutoCompleteCompleteEvent) {
    const filtered: ITeacher[] = [];
    const query = event.query;
    for (let i = 0; i < (this.teachers as ITeacher[]).length; i++) {
      const teacher = (this.teachers as ITeacher[])[i];
      if (teacher.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(teacher);
      }
    }
    this.filteredTeachers = filtered;
  }

  onClearDepartmentForm(): void {
    this.departmentForm.setValue({
      id: '',
      name: '',
      leader: {},
      quantity: '',
    });
  }

  openNew() {
    if (this.isFirstLoadDialog) {
      this.onInitDepartmentData().subscribe(() => {
        this.onClearDepartmentForm();
        this.isFirstLoadDialog = false;
        this.departmentDialog = true;
      });
    } else {
      this.onClearDepartmentForm();
      this.departmentDialog = true;
    }
  }

  // * --------------------- Refresh when there is a change --------------------
  onRefresh(): void {
    this.clear();
    this.getDepartments(this.params);
  }

  // * --------------------- Handle onSave Teacher Dialog --------------------
  onSaveDepartment(): void {
    this.handleDepartments = [];
    const { leader, ...rest } = this.departmentForm.value;
    console.log(
      '🚀 ~ file: department.component.ts:214 ~ DepartmentComponent ~ onSaveClass ~ this.departmentForm.value:',
      this.departmentForm.value
    );
    this.handleDepartments = [
      {
        ...rest,
        leaderId: leader?.id,
      },
    ];

    if (this.handleDepartments[0].id) {
      this.departmentService
        .updateDepartment(this.handleDepartments[0])
        .subscribe(
          response => {
            this.onRefresh();
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: response?.message,
            });
          },
          error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: error?.message || 'Cập nhật Lớp không thành công!',
            });
          }
        );
    } else {
      this.departmentService.addDepartment(this.handleDepartments).subscribe(
        response => {
          this.onRefresh();
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: response?.message,
          });
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: error?.message || 'Thêm Lớp không thành công!',
          });
        }
      );
    }
    this.departmentDialog = false;
  }

  // * --------------------- Delete Teacher Form --------------------
  onDelete(department: IDepartment): void {
    this.department = department;
    this.deleteDeparmentDialog = true;
  }

  // * --------------------- Confirm Delete Teacher Form --------------------
  onConfirmDelete(): void {
    this.departmentService.deleteDepartment([this.department.id]).subscribe(
      response => {
        this.onRefresh();
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: response?.message,
        });
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Xóa lớp không thành công!',
        });
      }
    );
    this.deleteDeparmentDialog = false;
  }

  // * --------------------- Hide Teacher Dialog --------------------
  onHideDialog(): void {
    this.department = {};
    this.onClearDepartmentForm();
    this.departmentDialog = false;
  }

  onDeleteSelectedDepartments() {
    this.deleteSelectedDepartmentsDialog = true;
  }

  onConfirmSelectedDelete(): void {
    console.log(this.selectedDepartments);
    this.departmentService
      .deleteDepartment(
        this.selectedDepartments.map(department => department.id)
      )
      .subscribe(
        response => {
          this.onRefresh();
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: response?.message,
          });
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: error?.message || 'Xóa Danh sách lớp không thành công!',
          });
        }
      );
    this.deleteSelectedDepartmentsDialog = false;
  }

  onExportExcel(): void {
    this.departmentService.getDepartments().subscribe(
      response => {
        this.exportedDepartments = response.data;
        this.tableExportService.exportExcel(
          this.exportedDepartments.map(department => {
            return {
              'Mã Phòng ban': department.id,
              'Trưởng Phòng ban': department.leader?.name || 'Không có',
              'Số lượng': department.quantity,
              'Trạng thái': department.status,
            };
          }),
          'departments'
        );
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Xuất danh sách không thành công!',
        });
      }
    );
  }
}
