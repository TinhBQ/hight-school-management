/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpOptions } from './helper';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private domain = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  getSchedule(): Observable<any> {
    return this.httpClient.get(
      this.domain + this.endpoint.timetables.root,
      httpOptions
    );
  }
}
