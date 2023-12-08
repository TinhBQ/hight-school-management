/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { OnInit, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { AssignmentService } from '../../../Services/assignment.service';
import { TeacherService } from '../../../Services/teacher.service';
import { IAssignment } from '../../../DTOs/assignment';
import { Table } from 'primeng/table';
import { ITeacher } from '../../../DTOs/teacher';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { paths } from 'src/app/helper/paths';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ClassService } from '../../../Services/class.service';
import { IClass } from '../../../DTOs/class';
import { AuthService } from '../../../Services/auth.service';
import { SubjectService } from '../../../Services/subject.service';
import { ISubject } from '../../../DTOs/subject';
import { MessageService } from 'primeng/api';
import { TableExportService } from '../../../Services/table-export.service';

interface Column {
  field: string;
  header: string;
}

interface Status {
  label: string;
  value: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
})
export class AssignmentComponent implements OnInit {
  assignments!: IAssignment[];
  assignment!: IAssignment;
  exportedAssignments!: IAssignment[];
  selectedAssignments!: IAssignment[];
  teachers: ITeacher[];
  teacher: ITeacher;
  filteredTeachers!: ITeacher[];
  classes!: IClass[];
  class: IClass;
  filteredClasses!: ITeacher[];
  subjects!: ISubject[];
  subject!: ISubject;
  filteredSubjects: ISubject[];
  cols: Column[];
  statuses: Status[];
  loading = false;
  totalRecords!: number;
  submitted = false;
  assignmentDialog = false;
  deleteAssignmentDialog = false;
  strClusters = '';
  isCheckClusters = false;
  value: string | undefined;
  exportColumns!: ExportColumn[];
  params: object = { page: 1, size: 10 };
  searchText$ = new Subject<string>();
  searchTeacher = '';
  isFirstLoadDialog = true;
  deleteSelectedAssignmentsDialog = false;

  constructor(
    private assignmentService: AssignmentService,
    private teacherService: TeacherService,
    private classService: ClassService,
    private router: Router,
    private authService: AuthService,
    private subjectService: SubjectService,
    private messageService: MessageService,
    private tableExportService: TableExportService
  ) {}

  ngOnInit(): void {
    // Handle Seacher
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(packageName =>
        this.getAssignments({ ...this.params, search: packageName })
      );

    this.cols = [
      { field: 'teacher', header: 'Họ và tên' },
      { field: 'subject', header: 'Môn giảng dạy' },
      { field: 'class', header: 'Lớp' },
      { field: 'lessonPerWeek', header: 'Số tiết/Tuần' },
      { field: 'clusters', header: 'Cụm' },
      { field: 'status', header: 'Trạng thái' },
    ];

    // 'deleted', 'inactivate', 'activate'
    this.statuses = [
      { label: 'Kích hoạt', value: 'activate' },
      { label: 'Không kích hoạt', value: 'inactivate' },
      { label: 'Đã xóa', value: 'deleted' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  @ViewChild('dt', {}) tableEL: Table;

  onLoadAssignments(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    this.params = { page: 1, size: rows };
    this.getAssignments({
      page: first / rows + 1,
      size: rows,
      sort: sortField,
      sortOrder: sortOrder === 1 ? '' : 'desc',
    });
  }

  getAssignments(params?: object): void {
    this.loading = true;
    this.assignmentService.getAssignments(params).subscribe(
      response => {
        this.assignments = response.data;
        this.totalRecords = response.itemCount;
        this.loading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Lấy danh sách Phân công Giáo viên không thành công!',
        });
        this.router.navigate([paths.auth.error]);
      }
    );
  }

  // * --------------------- Clear Table --------------------
  clear() {
    this.tableEL.clear();
    this.searchTeacher = '';
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
  onInitDataAssignmentDialog(): Observable<any> {
    return Observable.create(observer => {
      let isRefresh = false;
      forkJoin([
        this.teacherService.getTeachers(),
      this.classService.getClasses(),
      this.subjectService.getSubjects(),
      ])
        .pipe(
          catchError(error => {
            if (error === '401' && !isRefresh) {
              isRefresh = true;
              return this.authService.onRefreshToken().pipe(
                switchMap(response => {
                  const { accessToken, refreshToken } = response.data;
                  localStorage.setItem('accessToken', accessToken);
                  localStorage.setItem('refreshToken', refreshToken);
                  return this.onInitDataAssignmentDialog();
                }),
                catchError(() => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Thất bại',
                    detail: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
                  });
                  this.router.navigate([paths.auth.login]);
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
          this.teachers = response[0]?.data;
        this.classes = response[1]?.data;
        this.subjects = response[2]?.data;
          observer.next(response);
          observer.complete();
        });
    });
  }

  onRefresh(): void {
    this.clear();
    this.getAssignments(this.params);
  }

  

  // initData(): void {
  //   let isRefresh = false;
  //   forkJoin([
  //     this.assignmentService.getAssignments(),
  //     this.teacherService.getTeachers(),
  //     this.classService.getClasses(),
  //     this.subjectService.getSubjects(),
  //   ])
  //     .pipe(
  //       catchError(error => {
  //         if (error === '401' && !isRefresh) {
  //           isRefresh = true;
  //           this.authService.onRefreshToken().subscribe(
  //           (response) => {
  //               const { accessToken, refreshToken } = response.data;
  //               localStorage.setItem('accessToken', accessToken);
  //               localStorage.setItem(
  //                 'refreshToken',
  //                 refreshToken
  //               );
  //               this.initData();
  //             },
  //             (error) => {
  //               this.messageService.add({
  //                 severity: 'error',
  //                 summary: 'Thất bại',
  //                 detail:'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
  //               });
  //               this.router.navigate([paths.auth.login]);
  //               return of(error?.message);
  //             }
  //           );
  //         } else {
  //           this.router.navigate([paths.auth.error]);
  //         }
  //         return of('...');
  //       })
  //     )
  //     .subscribe(response => {
  //       this.assignments = response[0]?.data;
  //       this.teachers = response[1]?.data;
  //       this.classes = response[2]?.data;
  //       this.subjects = response[3]?.data;
  //     });
  // }

  // onLoadData(): void {
  //   this.loading = true;
  //   this.assignmentService.getAssignments().subscribe(
  //     response => {
  //       this.assignments = response.data;
  //       this.loading = false;
  //     },
  //     () => {
  //       this.router.navigate([paths.auth.error]);
  //     }
  //   );
  // }

  // onGlobalFilter(table: Table, event: Event) {
  //   table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  // }

  onTeacherIdChanged(): void {
    this.assignment.teacherId = this.teacher.id;
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

  onClassIdChanged(): void {
    this.assignment.classId = this.class.id;
  }

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

  onSubjectIdChanged(): void {
    this.assignment.subjectId = this.subject.id;
  }

  onClustersChanged(): void {
    const _clusters = (this.assignment.clusters = this.strClusters
      .split('-')
      .map(x => Number.parseInt(x)));
    this.assignment.clusters = _clusters.filter(x => !isNaN(x) && x !== 0);
    this.isCheckClusters = this.onCheckClusters(_clusters);
  }

  onCheckClusters(clusters: number[]): boolean {
    if (clusters[0] === 0 && !isNaN(clusters[0])) {
      return false;
    } else if (clusters[1] === 0 && clusters[2] !== 0) {
      return false;
    } else if (
      this.assignment.clusters.reduce(
        (total, currentValue) => total + currentValue,
        0
      ) !== this.assignment.lessonPerWeek
    ) {
      return false;
    }
    return true;
  }

  // Assignment Dialog
  openNew(): void {
    if (this.isFirstLoadDialog) {
      this.onInitDataAssignmentDialog().subscribe(() => {
        this.assignment = {};
        this.class = {};
        this.teacher = {};
        this.subject = {};
        this.submitted = false;
        this.assignmentDialog = true;
        this.isFirstLoadDialog = false;
      })
    } else {
      this.assignment = {};
        this.class = {};
        this.teacher = {};
        this.subject = {};
        this.submitted = false;
        this.assignmentDialog = true;
    }
  }

  openEdit(assignment: IAssignment): void {
    if (this.isFirstLoadDialog) {
      this.onInitDataAssignmentDialog().subscribe(() => {
        this.assignment = { ...assignment };

      if (this.assignment.clusters.length === 0) {
        this.strClusters = '0-0-0';
      } else if (this.assignment.clusters.length === 1)
      {
        this.strClusters = `${this.assignment.clusters[0]}-0-0`;
      } else if (this.assignment.clusters.length === 2)
      {
        this.strClusters = `${this.assignment.clusters[0]}-${this.assignment.clusters[1]}-0`;
      } else if (this.assignment.clusters.length === 3)
      {
        this.strClusters = `${this.assignment.clusters[0]}-${this.assignment.clusters[1]}-${this.assignment.clusters[2]}`;
      }

      this.isFirstLoadDialog = false;
      this.onLoadDataEdit()
      this.assignmentDialog = true;
      })
    } else {
      this.assignment = { ...assignment };

      if (this.assignment.clusters.length === 0) {
        this.strClusters = '0-0-0';
      } else if (this.assignment.clusters.length === 1)
      {
        this.strClusters = `${this.assignment.clusters[0]}-0-0`;
      } else if (this.assignment.clusters.length === 2)
      {
        this.strClusters = `${this.assignment.clusters[0]}-${this.assignment.clusters[1]}-0`;
      } else if (this.assignment.clusters.length === 3)
      {
        this.strClusters = `${this.assignment.clusters[0]}-${this.assignment.clusters[1]}-${this.assignment.clusters[2]}`;
      }
      this.onLoadDataEdit()
      this.assignmentDialog = true;
    }
  }

  onLoadDataEdit(): void {
    let isRefresh = false;
    forkJoin([
      this.classService.getClass(this.assignment.classId),
      this.teacherService.getTeacher(this.assignment.teacherId),
      this.subjectService.getSubject(this.assignment.subjectId)
    ])
      .pipe(
        catchError(error => {
          if (error === '401' && !isRefresh) {
            isRefresh = true;
            localStorage.setItem('isRefresh', isRefresh.toString());
            this.authService.onRefreshToken().subscribe(
              (response) => {
                const { accessToken, refreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem(
                  'refreshToken',
                  refreshToken
                );
                this.onLoadDataEdit();
              },
              (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Thất bại',
                  detail:'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
                });
                this.router.navigate([paths.auth.login]);
                return of(error?.message);
              },
              () => localStorage.setItem('isRefresh', 'false')
            );
          } else {
            this.router.navigate([paths.auth.error]);
          }
          return of('...');
        })
      )
      .subscribe(response => {
        this.class = response[0].data;
        this.teacher = response[1].data;
        this.subject = response[2].data
      });
  }

  onSaveAssignment(): void {
    this.submitted = true;

    // Thông tin chưa nhập đầy đủ
    if (Object.entries(this.assignment).length === 0) {
      return;
    }

    // Họ và tên Giáo viên chưa nhập
    if (!this.assignment.teacherId) {
      return;
    }

    // Môn giảng dạy chưa nhập
    if (!this.assignment.subjectId) {
      return;
    }

    //
    if (!this.assignment.classId) {
      return;
    }

    if (!this.assignment.lessonPerWeek) {
      return;
    }

    if (
      !this.assignment.clusters ||
      !this.onCheckClusters(this.assignment.clusters)
    ) {
      return;
    }

    if (this.assignment.id) {
      // Cập nhập
      this.assignmentService.updateAssignment(this.assignment).subscribe(
        response => {
          this.onRefresh();
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: response?.message });
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail:error?.message || 'Cập nhật phân công giảng dạy không thành công!',
          });
        }
      )
    } else {
      // Thêm
      // this.assignment.id = this.createId();

      this.assignmentService.addAssignment([this.assignment]).subscribe(
        response => {
          this.onRefresh();
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: response?.message });
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail:error?.message || 'Thêm phân công giảng dạy không thành công!',
          });
        }
      );
    }
  }

  onHideDialog(): void {
    this.assignmentDialog = false;
    this.submitted = false;
  }

  onDeleteAssignment(assignment: IAssignment): void {
    this.deleteAssignmentDialog = true;
    this.assignment = { ...assignment };
  }
  
  onConfirmDeleteAssignment(): void {
    this.deleteAssignmentDialog = false;
    this.assignmentService.deleteAssignment([this.assignment.id]).subscribe(
      response => {
        this.onRefresh();
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: response?.message });
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: error?.message || "Xóa phân công không thành công!" });
      }
    )
    this.assignment = {};
  }

  // onExportExcelAssignment(): void {
  //   this.tableExportService.exportExcel(this.assignments.map((assignment: IAssignment) => {
      // return {
      //   "Họ và tên": assignment.teacher,
      //   "Môn giảng dạy": assignment.subject,
      //   "Lớp": assignment.class,
      //   "Số tiết/Tuần": assignment.lessonPerWeek,
      //   "Cụm": assignment.clusters,
      //   "Trạng thái": this.statuses.filter(status => status.value === assignment.status)[0]?.label
      // }
  //   }), 'assignments');
  // }

  onExportExcelAssignment(): void {
    
    this.assignmentService.getAssignments().subscribe(
      response => {
        this.exportedAssignments = response.data;
        this.tableExportService.exportExcel(
          this.exportedAssignments.map(assignment => {
            return {
              "Họ và tên": assignment.teacher,
              "Môn giảng dạy": assignment.subject,
              "Lớp": assignment.class,
              "Số tiết/Tuần": assignment.lessonPerWeek,
              "Cụm": assignment.clusters,
              "Trạng thái": this.statuses.filter(status => status.value === assignment.status)[0]?.label
            }
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

  onConfirmSelectedDelete(): void {
    console.log('se', this.selectedAssignments)
    this.assignmentService
      .deleteAssignment(this.selectedAssignments.map(assignment => assignment.id))
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
    this.deleteSelectedAssignmentsDialog = false;
  }

  deleteSelectedTechers() {
    this.deleteSelectedAssignmentsDialog = true;
  }
}
