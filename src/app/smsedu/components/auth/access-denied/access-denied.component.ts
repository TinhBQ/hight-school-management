import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { paths } from 'src/app/helper/paths';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  onReturnLogin(): void {
    this.router.navigate([paths.auth.login]);
  }
}
