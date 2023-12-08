import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { paths } from 'src/app/helper/paths';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'login',
        loadChildren: () =>
          import('./login/login.module').then(m => m.LoginModule),
      },
      {
        path: 'error',
        loadChildren: () =>
          import('./error/error.module').then(m => m.ErrorModule),
      },
      {
        path: 'access-denied',
        loadChildren: () =>
          import('./access-denied/access-denied.module').then(
            m => m.AccessDeniedModule
          ),
      },
      { path: '**', redirectTo: paths.notFound },
    ]),
  ],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
