import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { paths } from 'src/app/helper/paths';
import { MessageService } from 'primeng/api';

// route, state
export const authGuard: CanActivateFn = () => {
  const accessToken = localStorage.getItem('accessToken');

  const router = inject(Router);
  if (!accessToken) {
    router.navigate([paths.auth.login]);
    inject(MessageService).add({
      severity: 'error',
      summary: 'Thất bại',
      detail:
        'Phiên đăng nhập của bạn hết hạn hoặc không thành công. Vui lòng đăng nhập lại.',
    });
    return false;
  }

  return true;
};
