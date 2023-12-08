/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAuth } from '../DTOs/auth';
import { environment } from 'src/environments/environment';
import { httpOptions, httpOptionsAccessToken } from './helper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private domain: string = environment.baseUrl;
  private endpoint = environment.endpoint;

  constructor(private httpClient: HttpClient) {}

  onLogin(auth: IAuth): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.auth.login,
      JSON.stringify(auth),
      httpOptions
    );
  }

  onRefreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.httpClient.post(
      this.domain + this.endpoint.auth.refreshToken,
      { refreshToken },
      httpOptionsAccessToken
    );
  }

  onLogout(): Observable<any> {
    return this.httpClient.post(
      this.domain + this.endpoint.auth.logout,
      httpOptions
    );
  }

  onforgotPassword(
    id: string,
    username: string,
    password: string
  ): Observable<any> {
    return this.httpClient.patch(
      this.domain + this.endpoint.auth.root,
      JSON.stringify({ id, username, password }),
      httpOptions
    );
  }
}
