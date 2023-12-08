import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { paths } from 'src/app/helper/paths';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-error',
  templateUrl: './error.component.html',
})
export class ErrorComponent {
  constructor(private router: Router) {}

  onReturnLogin(): void {
    this.router.navigate([paths.auth.login]);
  }
}
