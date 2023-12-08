/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Observable, catchError, forkJoin, of, switchMap } from 'rxjs';
import { paths } from 'src/app/helper/paths';
import { IClass } from 'src/app/smsedu/DTOs/class';
import { IColumn } from 'src/app/smsedu/DTOs/helper';
import { AuthService } from 'src/app/smsedu/Services/auth.service';
import { ClassService } from 'src/app/smsedu/Services/class.service';
import { ScheduleService } from 'src/app/smsedu/Services/schedule.service';
import { TableExportService } from 'src/app/smsedu/Services/table-export.service';

interface ITime {
  morning: string[];
  afternoon: string[];
}

interface Column {
  field: string;
  header: string;
}
interface ISchoolShift {
  id: string;
  name: string;
}

@Component({
  selector: 'app-schedule-grade',
  templateUrl: './schedule-grade.component.html',
})
export class ScheduleGradeComponent implements OnInit {
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
  schoolShifts: ISchoolShift[];
  schoolShift: ISchoolShift;
  cols!: Column[];

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
      // this.getScheduleByClass(this._class.name);
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
      this.schoolShift = this.schoolShifts[0];
      this.getData();
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
    this.getData();
  }

  getData() {
    this.cols = [];
    const _classes = this.getClassesBySchoolShift(
      this.schoolShift.id
    ) as IClass[];

    for (let i = 0; i < _classes.length; i++) {
      this.scheduleByClasses[_classes[i].name] = this.getScheduleByClass(
        _classes[i].name
      );
      this.cols.push({
        field: _classes[i].name,
        header: 'Lớp' + _classes[i].name,
      });
    }

    this.transformedArrays = Array.from({ length: 30 }, (_, index) => {
      const newObj = {};
      for (const key in this.scheduleByClasses) {
        if (
          Array.isArray(this.scheduleByClasses[key]) &&
          index + 1 <= this.scheduleByClasses[key].length
        ) {
          newObj[key] = this.scheduleByClasses[key][index + 1];
        } else if (!Array.isArray(this.scheduleByClasses[key])) {
          newObj[key] = this.scheduleByClasses[key];
        }
      }
      newObj['_index'] = index;
      return newObj;
    });
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

  getClassesBySchoolShift(schoolShift: string) {
    const arrGradeBySchoolShift = schoolShift === 'afternoon' ? [11] : [10, 12];
    return this.classes.filter(item =>
      arrGradeBySchoolShift.includes(parseInt(item.name, 10))
    );
  }

  getScheduleByClass(className: string) {
    // const arrGradeBySchoolShift = schoolShift === 'afternoon' ? [11] : [10, 12];

    this.periodsByClass = this.schedules.find(schedule => {
      return schedule.className === className;
    })?.periods;

    const arr = [];

    this.periodsByClass.map(item => {
      if (item.cluster === 1) {
        arr[item.startAtPeriod] = {
          subjectShortName: item.subjectShortName,
          teacherShortName: item.teacherShortName,
        };
      } else {
        for (
          let i = item.startAtPeriod;
          i < item.startAtPeriod + item.cluster;
          i++
        ) {
          arr[i] = {
            subjectShortName: item.subjectShortName,
            teacherShortName: item.teacherShortName,
          };
        }
      }
    });

    return arr;
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

  onFormatNumber(num: number) {
    // console.log(num);
    return Math.floor(num);
  }

  getWeekday(num: number) {
    return 'Thứ ' + (Math.floor(num / 5) + 2).toString();
  }

  getPeriod(num: number) {
    return 'Tiết ' + (Math.floor(num % 5) + 1).toString();
  }

  onExportExcel(): void {
    console.log(this.transformedArrays);

    this.tableExportService.exportExcel(
      this.transformedArrays.map((transformedArray: any) => {
        const obj: object = {};
        this.cols.map((col: IColumn) => {
          obj[col.header] = this.getDetail(transformedArray[col.field]);
        });
        return {
          Thứ: this.getWeekday(transformedArray['_index']),
          Tiết: this.getPeriod(transformedArray['_index']),
          ...obj,
        };
      }),
      'thoi-khoa-bieu'
    );
  }
}
