/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpOptions } from './helper';
import { environment } from 'src/environments/environment';
import { IDepartment } from '../DTOs/department';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private domain = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  getDepartments(params?: any): Observable<any> {
    return this.httpClient.get<any>(
      this.domain + this.endpoint.departments.root,
      {
        ...httpOptions,
        params,
      }
    );
  }

  getDepartment(id: string): Observable<any> {
    return this.httpClient.get<any>(
      this.domain + this.endpoint.departments.getById,
      {
        ...httpOptions,
        params: {
          id: id,
        },
      }
    );
  }

  updateDepartment(department: IDepartment): Observable<any> {
    return this.httpClient.put(
      this.domain + this.endpoint.departments.root,
      department,
      httpOptions
    );
  }

  addDepartment(departments: IDepartment[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.departments.root,
      departments,
      httpOptions
    );
  }

  deleteDepartment(ids: string[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.departments.deleteItem,
      ids,
      httpOptions
    );
  }
}
