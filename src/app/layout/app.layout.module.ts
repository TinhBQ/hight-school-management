import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { LogoMainModule } from '../smsedu/components/logo/logo-main/logo-main.module';
import { LogoShortModule } from '../smsedu/components/logo/logo-short/logo-short.module';
import { AppLayoutComponent } from './app.layout.component';
import { AppMenuComponent } from './menu/app.menu.component';
import { AppMenuItemComponent } from './menu/app.menuitem.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProfileModule } from '../smsedu/components/profile/profile.module';

@NgModule({
  declarations: [
    AppLayoutComponent,
    AppMenuComponent,
    AppMenuItemComponent,
    TopBarComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    LogoMainModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    BrowserModule,
    LogoShortModule,
    RouterModule,
    ProfileModule,
  ],
  exports: [AppLayoutComponent],
})
export class AppLayoutModule {}
