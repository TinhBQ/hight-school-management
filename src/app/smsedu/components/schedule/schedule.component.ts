/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../Services/schedule.service';
import { ISchedule } from '../../DTOs/schedule';
import { Observable, catchError, forkJoin, of, switchMap } from 'rxjs';
import { IClass } from '../../DTOs/class';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ClassService } from '../../Services/class.service';
import { AuthService } from '../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { paths } from 'src/app/helper/paths';
import { IPeriod } from '../../DTOs/period';

interface ITime {
  morning: string[];
  afternoon: string[];
}

interface IWeekday {
  subjectShortName: string;
  teacherShortName: string;
}

interface ITransformedArray {
  period: number;
  time: string;
  t2: IWeekday;
  t3: IWeekday;
  t4: IWeekday;
  t5: IWeekday;
  t6: IWeekday;
  t7: IWeekday;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent implements OnInit {
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
    private router: Router
  ) {}

  ngOnInit(): void {
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

  onLoadSchedule(event: any): void {
    if (this.isFirstLoadDialog) {
      this.onInitDepartmentData().subscribe(() => {
        this.getScheduleByClass(this._class.name);
        this.isFirstLoadDialog = false;
        console.log('transformedArray', this.transformedArrays);
        console.log('transformedObject', this.transformedObject);
      });
    } else {
      this.getScheduleByClass(this._class.name);
      console.log('transformedArray', this.transformedArrays);
      console.log('transformedObject', this.transformedObject);
    }
  }

  onChange(): void {
    this.getScheduleByClass(this._class.name);

    // for (let i = 0; i < this.classes.length; i++) {
    //   this.getScheduleByClass(this.classes[i].name);
    //   this.scheduleByClasses[this.classes[i].name] = this.scheduleByClass;
    // }

    // console.log('scheduleByClasses', this.scheduleByClasses);
    // console.log('llsls', this.classNames);
    // console.log(
    //   Array.from({ length: 30 }, (_, index) => {
    //     const newObj = {};
    //     for (const key in this.scheduleByClasses) {
    //       console.log('key', key);
    //       if (
    //         Array.isArray(this.scheduleByClasses[key]) &&
    //         index < this.scheduleByClasses[key].length
    //       ) {
    //         newObj[key] = this.scheduleByClasses[key][index + 1];
    //       } else if (!Array.isArray(this.scheduleByClasses[key])) {
    //         newObj[key] = this.scheduleByClasses[key];
    //       }
    //     }
    //     return newObj;
    //   })
    // );
  }

  onInitDepartmentData(): Observable<any> {
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
              return this.authService.onRefreshToken().pipe(
                switchMap(response => {
                  const { accessToken, refreshToken } = response.data;
                  localStorage.setItem('accessToken', accessToken);
                  localStorage.setItem('refreshToken', refreshToken);
                  return this.onInitDepartmentData();
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
}
