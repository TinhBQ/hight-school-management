/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import {
  catchError,
  finalize,
  switchMap,
  throwError,
  Observable,
  of,
} from 'rxjs';
import { Router } from '@angular/router';
import { paths } from './helper/paths';
import { environment } from 'src/environments/environment';
import { apiPublic } from './helper/apiPublic';
import { httpOptionsAccessToken } from './smsedu/Services/helper';
import { MessageService } from 'primeng/api';

@Injectable()
export class Interceptor implements HttpInterceptor {
  private domain: string = environment.baseUrl;
  private endpoint: any = environment.endpoint;
  private refreshing = false;
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('accessToken');

    if (localStorage.getItem('isRefresh') === 'true') {
      return throwError('401');
    }

    if (apiPublic.includes(request.url)) {
      return next.handle(request);
    }

    if (!accessToken) {
      this.router.navigate([paths.auth.accessDenied]);
      return throwError('...');
    }

    const decodedToken = jwtDecode(accessToken);

    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
      if (!this.refreshing) {
        this.refreshing = true;
        const refreshToken = localStorage.getItem('refreshToken'); // Lấy refresh token
        localStorage.setItem('isRefresh', 'true');

        return this.httpClient
          .post(
            this.domain + this.endpoint.auth.refreshToken,
            { refreshToken },
            httpOptionsAccessToken
          )
          .pipe(
            switchMap((res: any) => {
              localStorage.setItem('accessToken', res.data.accessToken);
              localStorage.setItem('refreshToken', res.data.refreshToken);
              return next
                .handle(
                  request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${localStorage.getItem(
                        'accessToken'
                      )}`,
                    },
                  })
                )
                .pipe(catchError(err => this.handleAuthError(err)));
            }),
            catchError(err => {
              this.messageService.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
              });
              this.router.navigate([paths.auth.login]);
              return throwError(err?.message);
            }),
            finalize(() => {
              this.refreshing = false;
              localStorage.setItem('isRefresh', 'false');
            })
          );
      } else {
        return throwError('401');
      }
    }

    return next
      .handle(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
      )
      .pipe(catchError(err => this.handleAuthError(err)));
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    if (err && (err.status === 500 || err.status === 404)) {
      this.router.navigate([paths.auth.error]);
    }

    return throwError('...');
  }
}
