/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Observable, catchError, forkJoin, of, switchMap } from 'rxjs';
import { paths } from 'src/app/helper/paths';
import { IClass } from 'src/app/smsedu/DTOs/class';
import { AuthService } from 'src/app/smsedu/Services/auth.service';
import { ClassService } from 'src/app/smsedu/Services/class.service';
import { ScheduleService } from 'src/app/smsedu/Services/schedule.service';
import { TableExportService } from 'src/app/smsedu/Services/table-export.service';

interface ITime {
  morning: string[];
  afternoon: string[];
}

@Component({
  selector: 'app-schedule-class',
  templateUrl: './schedule-class.component.html',
})
export class ScheduleClassComponent implements OnInit {
  transformedObject = {};
  transformedArrays = [];
  periodsByClass = [];
  scheduleByClass = [];
  period!: number[];
  time!: ITime;
  filteredClasses!: IClass[];
  classes!: IClass[];
  _class!: IClass;
  schedules = [];
  isFirstLoadDialog = true;
  classNames: string[];
  scheduleByClasses = [];

  constructor(
    private scheduleService: ScheduleService,
    private classService: ClassService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private tableExportService: TableExportService
  ) {}

  ngOnInit(): void {
    this.onInitScheduleData().subscribe(() => {
      this.getScheduleByClass(this._class.name);
    });

    this.period = [1, 2, 3, 4, 5];
    this.time = {
      morning: [
        '7h00 - 7h45',
        '7h50 - 8h35',
        '8h50 - 9h35',
        '9h40 - 10h25',
        '10h30 - 11h15',
      ],
      afternoon: [
        '13h00 - 13h45',
        '13h50 - 14h35',
        '14h50 -  15h35',
        '15h40 - 16h25',
        '16h30 - 17h15',
      ],
    };
  }

  onChange(): void {
    this.getScheduleByClass(this._class.name);
  }

  onInitScheduleData(): Observable<any> {
    return Observable.create(observer => {
      let isRefresh = false;
      forkJoin([
        this.scheduleService.getSchedule(),
        this.classService.getClasses({ sort: 'name' }),
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
                  return this.onInitScheduleData();
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
          this.schedules = response[0];
          this.classes = response[1].data;
          this._class = this.classes[0];
          this.classNames = this.classes.map(_class => _class.name);
          observer.next(response);
          observer.complete();
        });
    });
  }

  getScheduleByClass(className: string) {
    this.periodsByClass = this.schedules.find(
      schedule => schedule.className === className
    ).periods;

    this.periodsByClass.map(item => {
      if (item.cluster === 1) {
        this.scheduleByClass[item.startAtPeriod] = {
          subjectShortName: item.subjectShortName,
          teacherShortName: item.teacherShortName,
        };
      } else {
        for (
          let i = item.startAtPeriod;
          i < item.startAtPeriod + item.cluster;
          i++
        ) {
          this.scheduleByClass[i] = {
            subjectShortName: item.subjectShortName,
            teacherShortName: item.teacherShortName,
          };
        }
      }
    });

    for (let i = 1; i < this.scheduleByClass.length; i += 5) {
      const day = `t${Math.floor(i / 5) + 2}`;
      this.transformedObject[day] = this.scheduleByClass.slice(i, i + 5);
    }

    const _temp = {
      period: this.period,
      time:
        parseInt(className, 10) === 11
          ? this.time.afternoon
          : this.time.morning,
      ...this.transformedObject,
    };

    console.log('_temp', _temp);

    // Chuyển đối tượng thành mảng
    this.transformedArrays = Array.from({ length: 5 }, (_, index) => {
      const newObj = {};
      for (const key in _temp) {
        if (Array.isArray(_temp[key]) && index < _temp[key].length) {
          newObj[key] = _temp[key][index];
        } else if (!Array.isArray(_temp[key])) {
          newObj[key] = _temp[key];
        }
      }
      return newObj;
    });
  }

  getDetail(t: any) {
    if (!t) {
      return '';
    }

    return (
      t.subjectShortName +
      `${t.teacherShortName ? '(' + t.teacherShortName + ')' : ''}`
    );
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

  onExportExcel(): void {
    console.log(this.transformedArrays);
    this.tableExportService.exportExcel(
      this.transformedArrays.map((transformedArray: any) => {
        return {
          Tiết: transformedArray.period,
          'Thời gian': transformedArray.time,
          'Thứ 2': this.getDetail(transformedArray.t2),
          'Thứ 3': this.getDetail(transformedArray.t3),
          'Thứ 4': this.getDetail(transformedArray.t4),
          'Thứ 5': this.getDetail(transformedArray.t5),
          'Thứ 6': this.getDetail(transformedArray.t6),
          'Thứ 7': this.getDetail(transformedArray.t7),
        };
      }),
      'thoi-khoa-bieu'
    );
  }

  // onExportExcelAssignment(): void {
  //   this.tableExportService.exportExcel(
  //     this.assignments.map((assignment: IAssignment) => {
  //       return {
  //         'Họ và tên': assignment.teacher,
  //         'Môn giảng dạy': assignment.subject,
  //         Lớp: assignment.class,
  //         'Số tiết/Tuần': assignment.lessonPerWeek,
  //         Cụm: assignment.clusters,
  //         'Trạng thái': this.statuses.filter(
  //           status => status.value === assignment.status
  //         )[0]?.label,
  //       };
  //     }),
  //     'assignments'
  //   );
  // }
}
