/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Table } from 'primeng/table';
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
import { paths } from 'src/app/helper/paths';
import { fDate, convertStrToDate } from 'src/app/utils/format-time';
import { IClass } from '../../DTOs/class';
import { IDepartment } from '../../DTOs/department';
import { IColumn, IStatus } from '../../DTOs/helper';
import { ISubject } from '../../DTOs/subject';
import { ITeacher } from '../../DTOs/teacher';
import { AuthService } from '../../Services/auth.service';
import { ClassService } from '../../Services/class.service';
import { DepartmentService } from '../../Services/department.service';
import { SubjectService } from '../../Services/subject.service';
import { TeacherService } from '../../Services/teacher.service';
import { TableExportService } from '../../Services/table-export.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
})
export class TeacherComponent implements OnInit {
  teachers!: ITeacher[];
  handleTeachers!: ITeacher[];
  teacher!: ITeacher;
  selectedTeachers!: ITeacher[];
  exportedTeachers!: ITeacher[];

  subjects!: ISubject[];
  filteredSubjects!: ISubject[];
  subject!: ISubject;

  departments!: IDepartment[];
  filteredDepartments!: IDepartment[];
  department!: IDepartment;

  classes!: IClass[];
  filteredClasses!: IClass[];
  class!: IClass;

  cols!: IColumn[];
  statuses: IStatus[];

  teacherDialog = false;
  deleteTeacherDialog = false;
  deleteSelectedTeachersDialog = false;

  loading = false;
  isSearch = false;
  isOpenView = false;
  isFirstLoadDialog = true;

  searchTeacher = '';
  searchText$ = new Subject<string>();
  totalRecords!: number;

  teacherForm!: FormGroup;
  params: object = { page: 1, size: 10 };

  payload: object[];

  constructor(
    private teacherService: TeacherService,
    private fb: FormBuilder,
    private authService: AuthService,
    private subjectService: SubjectService,
    private messageService: MessageService,
    private router: Router,
    private departmentService: DepartmentService,
    private classService: ClassService,
    private tableExportService: TableExportService
  ) {}

  ngOnInit(): void {
    // Handle Seacher
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(packageName =>
        this.getTeachers({ ...this.params, search: packageName })
      );

    this.statuses = [
      { label: 'Kích hoạt', value: 'activate' },
      { label: 'Không kích hoạt', value: 'inactivate' },
      { label: 'Đã xóa', value: 'deleted' },
    ];
  }

  @ViewChild('dt', {}) tableEL: Table;

  // * --------------------- Load Data Teachers for Table --------------------
  onLoadTeachers(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    this.params = { page: 1, size: rows };
    this.getTeachers({
      page: first / rows + 1,
      size: rows,
      sort: sortField,
      sortOrder: sortOrder === 1 ? '' : 'desc',
    });
  }

  // * --------------------- Refresh when there is a change --------------------
  onRefresh(): void {
    this.clear();
    this.getTeachers(this.params);
  }

  // * --------------------- Clear Table --------------------
  clear() {
    this.tableEL.clear();
    this.searchTeacher = '';
  }

  // * --------------------- Get List Teacher for Services --------------------
  getTeachers(params?: object): void {
    this.loading = true;
    this.teacherService.getTeachers(params).subscribe(
      response => {
        this.teachers = response.data;
        this.totalRecords = response.itemCount;
        this.loading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Lấy danh sách Giáo viên không thành công!',
        });
        this.router.navigate([paths.auth.error]);
      }
    );
  }

  // * --------------------- Handle Search --------------------
  getSearchValue(event: Event): string {
    this.searchTeacher = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }
  onSearch(packageName: string) {
    this.searchText$.next(packageName);
  }

  // * --------------------- Call APIs Serve for Edit Teacher --------------------
  onInitDataTeacherDialog(): Observable<any> {
    return Observable.create(observer => {
      let isRefresh = false;
      forkJoin([
        this.subjectService.getSubjects(),
        this.departmentService.getDepartments(),
        this.classService.getClasses(),
      ])
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
                  return this.onInitDataTeacherDialog();
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
          this.subjects = response[0].data;
          this.departments = response[1].data;
          this.classes = response[2].data;
          observer.next(response);
          observer.complete();
        });
    });
  }

  // * --------------------- Init Teacher Form --------------------
  onInitTeacherForm(): void {
    this.teacherForm = this.fb.group({
      id: [''],
      name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[\p{Lu}][\p{L}']+([\s][\p{Lu}][\p{L}']+)*$/mu),
        ]),
      ],
      nickname: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[\p{L}()\s\d]*$/mu),
        ]),
      ],
      mainSubject: [{}, Validators.compose([Validators.required])],
      department: [{}, Validators.compose([Validators.required])],
      _class: [{}, Validators.compose([Validators.required])],
      gender: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(M|F)$/),
        ]),
      ],
      isUnionMember: [false],
      isPartyMember: [false],
      phone: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^\d{10}$/),
        ]),
      ],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      address: ['', Validators.compose([Validators.required])],
      dateOfBirth: ['', Validators.compose([Validators.required])],
      qualification: ['', Validators.compose([Validators.required])],
      dateOfRecruitment: ['', Validators.compose([Validators.required])],
    });
  }

  // * --------------------- Call Api Get Teacher By Id Use To Edit Teacher --------------------
  onLoadDataTeacherDialog(id: string): void {
    this.teacherService.getTeacher(id).subscribe(
      response => {
        const {
          id,
          name,
          nickname,
          mainSubject,
          classes,
          gender,
          isUnionMember,
          isPartyMember,
          phone,
          email,
          address,
          dateOfBirth,
          qualification,
          dateOfRecruitment,
          department,
        } = response.data;
        console.log('dateOfBirth', dateOfBirth);
        this.teacherForm.setValue({
          id,
          name,
          mainSubject,
          department,
          _class: classes.length > 0 ? classes[0] : {},
          nickname,
          gender,
          isUnionMember,
          isPartyMember,
          phone,
          email,
          address,
          dateOfBirth: !dateOfBirth
            ? ''
            : convertStrToDate(dateOfBirth, 'yyyy-MM-dd'),
          qualification,
          dateOfRecruitment: !dateOfRecruitment
            ? ''
            : convertStrToDate(dateOfRecruitment, 'yyyy-MM-dd'),
        });
        this.teacherDialog = true;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Lấy thông tin Giáo viên không thành công!',
        });
        this.teacherDialog = false;
      }
    );
  }

  // * --------------------- Handle Call Api When Open Dialog --------------------
  open(id: string): void {
    if (this.isFirstLoadDialog) {
      this.onInitDataTeacherDialog().subscribe(
        () => {
          this.onInitTeacherForm();
          this.onLoadDataTeacherDialog(id);
        },
        () => {
          //----
        },
        () => {
          if (this.isOpenView) {
            this.teacherForm.disable();
          } else {
            this.teacherForm.enable();
          }
        }
      );
      this.isFirstLoadDialog = false;
    } else {
      this.onLoadDataTeacherDialog(id);
      if (this.isOpenView) {
        this.teacherForm.disable();
      } else {
        this.teacherForm.enable();
      }
    }
  }

  // * --------------------- Open Detail View Teacher Dialog --------------------
  openDetail(id: string): void {
    this.isOpenView = true;
    this.open(id);
  }

  // * --------------------- Open Edit View Teacher Dialog --------------------
  openEdit(id: string) {
    this.isOpenView = false;
    this.open(id);
  }

  // * --------------------- Open New View Teacher Dialog --------------------
  openNew() {
    if (this.isFirstLoadDialog) {
      this.onInitDataTeacherDialog().subscribe(
        () => {
          this.onInitTeacherForm();
        },
        err => console.log(err),
        () => {
          this.class = {};
          this.subject = {};
          this.department = {};
          this.teacher = {};
          this.isFirstLoadDialog = false;
          this.teacherDialog = true;
        }
      );
    } else {
      this.class = {};
      this.subject = {};
      this.department = {};
      this.teacher = {};
      this.onClearTeacherForm();
      this.teacherDialog = true;
    }
  }

  // * --------------------- Handle onSave Teacher Dialog --------------------
  onSaveTeacher(): void {
    this.handleTeachers = [];
    const {
      _class,
      mainSubject,
      department,
      dateOfBirth,
      dateOfRecruitment,
      id,
      ...rest
    } = this.teacherForm.value;
    this.handleTeachers = [
      {
        id,
        ...rest,
        classId: _class?.id,
        mainSubjectId: mainSubject?.id,
        departmentId: department?.id,
        dateOfBirth: fDate(dateOfBirth, 'yyyy-MM-dd'),
        dateOfRecruitment: fDate(dateOfRecruitment, 'yyyy-MM-dd'),
      },
    ];

    if (this.handleTeachers[0].id) {
      this.teacherService.updateTeacher(this.handleTeachers[0]).subscribe(
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
            detail: error?.message || 'Cập nhật Giảng viên không thành công!',
          });
        }
      );
    } else {
      // this.handleTeachers[0].id = null;
      this.teacherService.addTeacher(this.handleTeachers).subscribe(
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
            detail: error?.message || 'Thêm Giảng viên không thành công!',
          });
        }
      );
    }
  }

  // * --------------------- Hide Teacher Dialog --------------------
  onHideDialog(): void {
    this.class = {};
    this.subject = {};
    this.department = {};
    this.teacher = {};
    this.onClearTeacherForm();
    this.teacherDialog = false;
  }

  // * --------------------- Clear Teacher Form Group --------------------
  onClearTeacherForm(): void {
    this.teacherForm.setValue({
      id: '',
      name: '',
      mainSubject: {},
      department: {},
      _class: {},
      nickname: '',
      gender: '',
      isUnionMember: '',
      isPartyMember: '',
      phone: '',
      email: '',
      address: '',
      dateOfBirth: '',
      qualification: '',
      dateOfRecruitment: '',
    });
  }

  // * --------------------- Delete Teacher Form --------------------
  onDelete(teacher: ITeacher): void {
    this.teacher = teacher;
    this.deleteTeacherDialog = true;
  }

  // * --------------------- Confirm Delete Teacher Form --------------------
  onConfirmDelete(): void {
    this.teacherService.deleteTeacher([this.teacher.id]).subscribe(
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
          detail: error?.message || 'Xóa Giáo viên không thành công!',
        });
      }
    );
    this.deleteTeacherDialog = false;
  }

  onConfirmSelectedDelete(): void {
    this.teacherService
      .deleteTeacher(this.selectedTeachers.map(teacher => teacher.id))
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
            detail:
              error?.message || 'Xóa Danh sách Giáo viên không thành công!',
          });
        }
      );
    this.deleteSelectedTeachersDialog = false;
  }

  // * --------------------- Filter AutoComplete Subject --------------------
  onFilterSubject(event: AutoCompleteCompleteEvent) {
    const filtered: ISubject[] = [];
    const query = event.query;

    for (let i = 0; i < (this.subjects as ISubject[]).length; i++) {
      const subject = (this.subjects as ISubject[])[i];
      if (subject.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(subject);
      }
    }

    this.filteredSubjects = filtered;
  }

  // * --------------------- Filter AutoComplete Department --------------------
  onFilterDepartment(event: AutoCompleteCompleteEvent) {
    const filtered: IDepartment[] = [];
    const query = event.query;

    for (let i = 0; i < (this.departments as IDepartment[]).length; i++) {
      const department = (this.departments as IDepartment[])[i];
      if (department.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(department);
      }
    }

    this.filteredDepartments = filtered;
  }

  // * --------------------- Filter AutoComplete Class --------------------
  onFliterClass(event: AutoCompleteCompleteEvent) {
    const filtered: IClass[] = [];
    const query = event.query;

    for (let i = 0; i < (this.classes as IClass[]).length; i++) {
      const classs = (this.classes as IClass[])[i];
      if (classs.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(classs);
      }
    }

    this.filteredClasses = filtered;
  }

  onUploadTeachers(event: any) {
    console.log(
      '🚀 ~ file: teacher.component.ts:533 ~ TeacherComponent ~ onUploadTeachers ~ event:',
      event
    );
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = () => {
      import('xlsx').then(xlsx => {
        const workBook = xlsx.read(fileReader.result, { type: 'binary' });
        const sheetNames = workBook.SheetNames;
        console.log(
          'BQT',
          xlsx.utils.sheet_to_json(workBook.SheetNames[sheetNames[0]])
        );
      });
    };
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>evt.target;

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;

      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];

      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      console.log('ws', ws);
      const data = Object.values(XLSX.utils.sheet_to_json(ws, { header: 1 }));

      console.log('ws 1', XLSX.utils.sheet_to_json(ws, { header: 1 }));
      console.log('ws 2', XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1));

      console.log('result', this.convertToObj(data));
    };

    reader.readAsBinaryString(target.files[0]);
  }

  convertToObj = (arr: any[]): Record<string, any>[] => {
    const keys = arr[0];
    const result: Record<string, any>[] = [];

    for (let i = 1; i < arr.length; i++) {
      const obj: Record<string, any> = {};

      for (let j = 0; j < keys.length; j++) {
        obj[keys[j]] = arr[i][j];
      }

      result.push(obj);
    }

    return result;
  };

  deleteSelectedTechers() {
    this.deleteSelectedTeachersDialog = true;
  }

  onExportExcelAssignment(): void {
    this.teacherService.getTeachers().subscribe(
      response => {
        this.exportedTeachers = response.data;
        this.tableExportService.exportExcel(
          this.exportedTeachers.map((teacher: ITeacher) => {
            return {
              'Họ và tên': teacher.name,
              'Biệt danh': teacher.nickname || 'Không có',
              'Giới tính': teacher.gender === 'M' ? 'Nữ' : 'Nam',
              'Phòng ban': teacher.department,
              'Ngày sinh': teacher.dateOfBirth,
              'Trạng thái': teacher.status,
            };
          }),
          'assignments'
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
