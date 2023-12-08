import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { paths } from 'src/app/helper/paths';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  checked = false;
  blockedUI = false;
  loginForm: FormGroup = this.fb.group({
    username: [
      '',
      Validators.compose([Validators.required, Validators.minLength(8)]),
    ],
    password: [
      '',
      Validators.compose([Validators.required, Validators.minLength(8)]),
    ],
    isForgotPassword: false,
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router
  ) {}

  get username() {
    return this.loginForm.controls['username'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }

  get isForgotPassword() {
    return this.loginForm.controls['isForgotPassword'];
  }

  onSubmit() {
    this.blockedUI = true;
    this.authService
      .onLogin({ username: this.username.value, password: this.password.value })
      .subscribe(
        response => {
          // Xử lý kết quả sau khi đăng nhập thành công
          const { data } = response;
          // if (data.role !== 'admin') {
          //   return;
          // }

          console.log(response);

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: response?.message,
          });

          this.router.navigate([paths.smsedu.teacher.root]);
        },
        error => {
          // Xử lý lỗi
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: error?.error?.message,
          });
        }
      )
      .add(() => {
        this.blockedUI = false;
        this.cdr.markForCheck(); // Đánh giấu sự thay đổi
      });
  }
}
