/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpOptions } from './helper';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private domain = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  getSubjects(params?: any): Observable<any> {
    return this.httpClient.get(this.domain + this.endpoint.subjects.root, {
      ...httpOptions,
      params,
    });
  }

  getSubject(id: string): Observable<any> {
    return this.httpClient.get(this.domain + this.endpoint.subjects.getById, {
      ...httpOptions,
      params: {
        id: id,
      },
    });
  }
}
