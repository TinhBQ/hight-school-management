/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpOptions } from './helper';
import { environment } from 'src/environments/environment';
import { IClass } from '../DTOs/class';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private domain = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  getClasses(params?: any): Observable<any> {
    return this.httpClient.get(this.domain + this.endpoint.classes.root, {
      params,
      ...httpOptions,
    });
  }

  getClass(id: string): Observable<any> {
    return this.httpClient.get(this.domain + this.endpoint.classes.getById, {
      ...httpOptions,
      params: {
        id: id,
      },
    });
  }

  updateClass(_class: IClass): Observable<any> {
    return this.httpClient.put(
      this.domain + this.endpoint.classes.root,
      _class,
      httpOptions
    );
  }

  addClass(classes: IClass[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.classes.root,
      classes,
      httpOptions
    );
  }

  deleteClass(ids: string[]): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.classes.deleteItem,
      ids,
      httpOptions
    );
  }
}
