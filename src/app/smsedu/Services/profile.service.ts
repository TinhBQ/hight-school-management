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
export class ProfileService {
  private domain = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  getProfileTeacher(id: string): Observable<any> {
    return this.httpClient.get(
      this.domain + this.endpoint.profiles.root + '/' + id,
      httpOptions
    );
  }

  updateProfileTeacher(teacher: ITeacher): Observable<any> {
    return this.httpClient.put(
      this.domain + this.endpoint.profiles.root,
      teacher,
      httpOptions
    );
  }
}
