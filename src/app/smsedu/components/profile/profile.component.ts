/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProfileService } from '../../Services/profile.service';
import { IProfile } from '../../DTOs/profile';
import { jwtDecode } from 'jwt-decode';
import { ITeacher } from '../../DTOs/teacher';
import { AuthService } from '../../Services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { paths } from 'src/app/helper/paths';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fDate, convertStrToDate } from 'src/app/utils/format-time';

interface IToken {
  tid: string;
  uid: string;
  rol: string;
  nbf: string;
  exp: string;
  iat: string;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  _profile!: IProfile;
  teacher!: ITeacher;
  topbarItemClick: boolean;
  activeTopbarItem: any;
  logoutDialog = false;
  forgotPasswordDialog = false;
  rightPanelClick: boolean;
  rightPanelActive: boolean;
  teacherDialog = false;

  forgotPasswordForm: FormGroup = this.fb.group(
    {
      newPassword: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)]),
      ],
      confirmPassword: ['', Validators.compose([Validators.required])],
    },
    {
      validator: this.passwordMatchValidator, // Thêm validator tại đây
    }
  );

  teacherForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.profileService
      .getProfileTeacher(
        (jwtDecode(localStorage.getItem('accessToken')) as IToken).uid as string
      )
      .subscribe(
        response => {
          console.log('response', response.data);
          this._profile = response.data;
          // this.profileEl.nativeElement.value = response.data as IProfile;
          this.teacherForm = this.fb.group({
            id: [this._profile.id],
            name: [
              this._profile.teacher.name,
              Validators.compose([
                Validators.required,
                Validators.pattern(
                  /^[\p{Lu}][\p{L}']+([\s][\p{Lu}][\p{L}']+)*$/mu
                ),
              ]),
            ],
            nickname: [
              this._profile.teacher.nickname,
              Validators.compose([
                Validators.required,
                Validators.pattern(/^[\p{L}()\s\d]*$/mu),
              ]),
            ],
            gender: [
              this._profile.teacher.gender,
              Validators.compose([
                Validators.required,
                Validators.pattern(/^(M|F)$/),
              ]),
            ],
            phone: [
              this._profile.teacher.phone,
              Validators.compose([
                Validators.required,
                Validators.pattern(/^\d{10}$/),
              ]),
            ],
            email: [
              this._profile.teacher.email,
              Validators.compose([Validators.required, Validators.email]),
            ],
            address: [
              this._profile.teacher.address,
              Validators.compose([Validators.required]),
            ],
            dateOfBirth: [
              convertStrToDate(this._profile.teacher.dateOfBirth, 'yyyy-MM-dd'),
              Validators.compose([Validators.required]),
            ],
          });
        },
        error => console.log('error', error)
      );
  }

  @ViewChild('profile', {}) profileEl: ElementRef;

  // ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword').value === g.get('confirmPassword').value
      ? null
      : { mismatch: true };
  }

  onProfileItemClick(event, item) {
    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  onCloseProfileItem() {
    this.activeTopbarItem = null;
  }

  onLogout(): void {
    this.authService.onLogout().subscribe(
      response => {
        localStorage.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: response?.message,
        });
        this.router.navigate([paths.auth.login]);
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Đăng xuất không thành công',
        });
      }
    );
  }

  onConfirmLogout() {
    this.confirmationService.confirm({
      message: 'Bạn chắn chắn muốn đăng xuất?',
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.onLogout();
      },
    });
  }

  onCofirmForgotPassword() {
    this.confirmationService.confirm({
      message: 'Bạn chắn chắn muốn thay đổi mật khẩu?',
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.authService
          .onforgotPassword(
            this._profile.id,
            this._profile.username,
            this.forgotPasswordForm.controls['newPassword'].value
          )
          .subscribe(
            response => {
              this.messageService.add({
                severity: 'success',
                summary: 'Thành công',
                detail: response?.message + ' Vui lòng đăng nhập lại!',
              });
              localStorage.clear();
              this.router.navigate([paths.auth.login]);
            },
            error => {
              this.messageService.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: error?.message || 'Thay đổi mật khẩu',
              });
            }
          );
      },
    });
  }

  onCofirmUpdateProfile() {
    this.confirmationService.confirm({
      message: 'Bạn chắn chắn muốn thay đổi mật khẩu?',
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const { dateOfBirth, ...rest } = this.teacherForm.value;
        this.teacher = {
          dateOfBirth: fDate(dateOfBirth, 'yyyy-MM-dd'),
          ...rest,
        };
        this.profileService.updateProfileTeacher(this.teacher).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: response?.message,
            });
          },
          error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail:
                error?.message || 'Cập nhật hồ sơ cá nhân không thành công',
            });
          }
        );
      },
    });
  }

  onOpenForgotPasswordDialog() {
    this.forgotPasswordDialog = true;
  }

  onOpenEditProfile() {
    this.teacherDialog = true;
  }
}
