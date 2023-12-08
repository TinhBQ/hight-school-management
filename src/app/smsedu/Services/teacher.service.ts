/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpOptions } from './helper';
import { environment } from 'src/environments/environment';
import { ITeacher } from '../DTOs/teacher';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private domain = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  getTeachers(params?: any): Observable<any> {
    return this.httpClient.get(this.domain + this.endpoint.teachers.root, {
      params,
      ...httpOptions,
    });
  }

  getTeacher(id: string): Observable<any> {
    return this.httpClient.get(this.domain + this.endpoint.teachers.getById, {
      ...httpOptions,
      params: {
        id: id,
      },
    });
  }

  updateTeacher(teacher: ITeacher): Observable<any> {
    return this.httpClient.put(
      this.domain + this.endpoint.teachers.root,
      teacher,
      httpOptions
    );
  }

  addTeacher(teachers: ITeacher[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.teachers.root,
      teachers,
      httpOptions
    );
  }

  deleteTeacher(ids: string[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.teachers.deleteItem,
      ids,
      httpOptions
    );
  }
}
