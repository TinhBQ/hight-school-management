/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAssignment } from '../DTOs/assignment';
import { httpOptions } from './helper';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private domain = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  getAssignments(params?: any): Observable<any> {
    return this.httpClient.get(this.domain + this.endpoint.assignments.root, {
      params: params,
      ...httpOptions,
    });
  }

  addAssignment(assignments: IAssignment[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.assignments.root,
      assignments,
      httpOptions
    );
  }

  updateAssignment(assignment: IAssignment): Observable<any> {
    return this.httpClient.put(
      this.domain + this.endpoint.assignments.root,
      assignment,
      httpOptions
    );
  }

  deleteAssignment(ids: string[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.assignments.deleteItem,
      ids,
      httpOptions
    );
  }
}
