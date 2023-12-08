/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnInit, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { ClassService } from '../../Services/class.service';
import { paths } from 'src/app/helper/paths';
import { Router } from '@angular/router';
import { IClass } from '../../DTOs/class';
import { IColumn, IStatus } from '../../DTOs/helper';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  switchMap,
} from 'rxjs';
import { ITeacher } from '../../DTOs/teacher';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { TeacherService } from '../../Services/teacher.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { fDate } from 'src/app/utils/format-time';
import { TableExportService } from '../../Services/table-export.service';

interface IGrade {
  id: string;
  name: string;
}

interface ISchoolShift {
  id: string;
  name: string;
}

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
})
export class ClassComponent implements OnInit {
  classes!: IClass[];
  handleClasses!: IClass[];
  _class: IClass;
  selectedClasses!: IClass[];
  exportedClasses!: IClass[];
  loading = false;
  cols!: IColumn[];
  statuses!: IStatus[];
  classDialog = false;
  grades!: IGrade[];
  schoolShifts: ISchoolShift[];
  totalRecords!: number;
  params: object = { page: 1, size: 10 };
  searchClass = '';
  searchText$ = new Subject<string>();
  filteredTeachers!: ITeacher[];
  teachers!: ITeacher[];
  isFirstLoadDialog = true;
  deleteClassDialog = false;
  deleteSelectedClassesDialog = false;

  classForm: FormGroup = this.fb.group({
    id: [''],
    grade: ['', Validators.compose([Validators.required])],
    teacher: ['', Validators.compose([Validators.required])],
    name: ['', Validators.compose([Validators.required])],
    schoolShift: ['', Validators.compose([Validators.required])],
    schoolYear: ['', Validators.compose([Validators.required])],
    quantity: [0, Validators.compose([Validators.required])],
  });

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private router: Router,
    private messageService: MessageService,
    private teacherService: TeacherService,
    private authService: AuthService,
    private tableExportService: TableExportService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(packageName =>
        this.getClasses({ ...this.params, search: packageName })
      );

    this.cols = [
      { field: 'name', header: 'Lớp' },
      { field: 'formTeacher', header: 'Chủ nhiệm' },
      { field: 'quantity', header: 'Sỉ số' },
      { field: 'schoolShift', header: 'Buổi' },
      { field: 'status', header: 'Trạng thái' },
    ];

    this.statuses = [
      { label: 'Kích hoạt', value: 'activate' },
      { label: 'Không kích hoạt', value: 'inactivate' },
      { label: 'Đã xóa', value: 'deleted' },
    ];

    this.grades = [
      {
        id: '10',
        name: 'Khối 10',
      },
      {
        id: '11',
        name: 'Khối 11',
      },
      {
        id: '12',
        name: 'Khối 12',
      },
    ];

    this.schoolShifts = [
      {
        id: 'morning',
        name: 'Buổi sáng',
      },
      {
        id: 'afternoon',
        name: 'Buổi chiều',
      },
    ];
  }

  @ViewChild('dt', {}) tableEL: Table;

  // * --------------------- Load Data Classes for Table --------------------
  onLoadClasses(event: any): void {
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
    this.getClasses(_params);
  }

  // * --------------------- Get List Classes for Services --------------------
  getClasses(params?: object): void {
    this.loading = true;
    this.classService.getClasses(params).subscribe(
      response => {
        this.classes = response.data;
        this.totalRecords = response.itemCount;
        this.loading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Lấy danh sách lớp không thành công!',
        });
        this.router.navigate([paths.auth.error]);
      }
    );
  }

  // * --------------------- Clear Table --------------------
  clear() {
    this.tableEL.clear();
    this.searchClass = '';
  }

  // * --------------------- Handle Search --------------------
  getSearchValue(event: Event): string {
    this.searchClass = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }

  onSearch(packageName: string) {
    this.searchText$.next(packageName);
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

  onInitClassData(): Observable<any> {
    return Observable.create(observer => {
      let isRefresh = false;
      forkJoin([this.teacherService.getTeachers()])
        .pipe(
          catchError(error => {
            if (error === '401' && !isRefresh) {
              isRefresh = true;
              localStorage.setItem('isRefresh', isRefresh.toString());
              return this.authService.onRefreshToken().pipe(
                switchMap(response => {
                  const { accessToken, refreshToken } = response.data;
                  localStorage.setItem('accessToken', accessToken);
                  localStorage.setItem('refreshToken', refreshToken);
                  localStorage.setItem('isRefresh', 'false');
                  return this.onInitClassData();
                }),
                catchError(() => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Thất bại',
                    detail: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
                  });
                  this.router.navigate([paths.auth.login]);
                  localStorage.setItem('isRefresh', 'false');
                  return of('...');
                })
              );
            } else {
              this.router.navigate([paths.auth.error]);
              return of('...');
            }
          })
        )
        .subscribe(response => {
          this.teachers = response[0].data;
          observer.next(response);
          observer.complete();
        });
    });
  }

  onLoadClass(id: string): void {
    this.classService.getClass(id).subscribe(
      response => {
        const {
          id,
          name,
          schoolShift,
          schoolYear,
          quantity,
          formTeacher,
          grade,
        } = response.data;
        this.classForm.setValue({
          id,
          name,
          schoolShift: this.schoolShifts.find(s => s.id === schoolShift),
          grade: this.grades.find(s => s.id === grade.id),
          teacher: formTeacher,
          schoolYear,
          quantity,
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  openEdit(id: string) {
    if (this.isFirstLoadDialog) {
      this.onInitClassData().subscribe(() => {
        this.onLoadClass(id);
      });
      this.isFirstLoadDialog = false;
      this.classDialog = true;
    } else {
      this.onLoadClass(id);
      this.classDialog = true;
    }
  }

  onClearClassForm(): void {
    this.classForm.setValue({
      id: '',
      name: '',
      schoolShift: {},
      grade: {},
      teacher: {},
      schoolYear: '',
      quantity: '',
    });
  }

  openNew() {
    if (this.isFirstLoadDialog) {
      this.onInitClassData().subscribe(() => {
        this.onClearClassForm();
        this.isFirstLoadDialog = false;
        this.classDialog = true;
      });
    } else {
      this.onClearClassForm();
      this.classDialog = true;
    }
  }

  // * --------------------- Refresh when there is a change --------------------
  onRefresh(): void {
    this.clear();
    this.getClasses(this.params);
  }

  // * --------------------- Handle onSave Teacher Dialog --------------------
  onSaveClass(): void {
    this.handleClasses = [];
    const { grade, teacher, schoolShift, schoolYear, ...rest } =
      this.classForm.value;
    this.handleClasses = [
      {
        ...rest,
        gradeId: grade?.id,
        formTeacherId: teacher?.id,
        schoolShift: schoolShift?.id,
        schoolYear: fDate(schoolYear, 'yyyy'),
      },
    ];
    if (this.handleClasses[0].id) {
      this.classService.updateClass(this.handleClasses[0]).subscribe(
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
      this.classService.addClass(this.handleClasses).subscribe(
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
    this.classDialog = false;
  }

  // * --------------------- Delete Teacher Form --------------------
  onDelete(_class: IClass): void {
    this._class = _class;
    this.deleteClassDialog = true;
  }

  // * --------------------- Confirm Delete Teacher Form --------------------
  onConfirmDelete(): void {
    this.classService.deleteClass([this._class.id]).subscribe(
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
    this.deleteClassDialog = false;
  }

  // * --------------------- Hide Teacher Dialog --------------------
  onHideDialog(): void {
    this._class = {};
    this.onClearClassForm();
    this.classDialog = false;
  }

  onDeleteSelectedClasses() {
    this.deleteSelectedClassesDialog = true;
  }

  onConfirmSelectedDelete(): void {
    console.log(this.selectedClasses);
    this.classService
      .deleteClass(this.selectedClasses.map(_class => _class.id))
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
    this.deleteSelectedClassesDialog = false;
  }

  onExportExcel(): void {
    this.classService.getClasses().subscribe(
      response => {
        this.exportedClasses = response.data;
        this.tableExportService.exportExcel(
          this.exportedClasses.map((_class: IClass) => {
            return {
              Lớp: _class.name,
              'Chủ nhiệm': _class.formTeacher,
              'Số lượng': _class.quantity,
              Buổi: _class.schoolShift,
              'Trạng thái': _class.status,
            };
          }),
          'classes'
        );
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Xóa Giáo viên không thành công!',
        });
      }
    );
  }
}
