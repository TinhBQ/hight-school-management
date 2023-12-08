import { EventEmitter, OnInit, Output } from '@angular/core';
import { Component, HostListener } from '@angular/core';
import { navData } from '../helper/nav-data';
import { INavBar } from 'src/app/layout/DTOs/INavBar';
import { fadeInOut } from 'src/app/helper/animations';
import { Router } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  animations: [
    fadeInOut,
    trigger('slideInOut', [
      state('in', style({ transform: 'width(48px)' })),
      state('out', style({ transform: 'width(280px)' })),
      transition('in => out', animate('0.5s ease-in-out')),
      transition('out => in', animate('0.5s ease-in-out')),
    ]),
  ],
})
export class AppMenuComponent implements OnInit {
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();

  navData: INavBar[] = navData;
  screenWidth = 0;
  collapsed = false;
  strIconHeader = 'pi pi-chevron-right';
  multiple = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({
        collapsed: this.collapsed,
        screenWidth: this.screenWidth,
      });
    }
  }

  constructor(public router: Router) {
    console.log(
      'router ',
      this.router.url.split('/').slice(2).join('/').includes('')
    );
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }

  onToggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.strIconHeader = this.collapsed
      ? 'pi pi-chevron-left'
      : 'pi pi-chevron-right';
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  onCloseSideNav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  onOpenSideNav(): void {
    this.collapsed = true;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  handleClick(item: INavBar): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded;
  }

  getActiveClass(data: INavBar): string {
    if (!this.collapsed) {
      return this.router.url
        .split('/')
        .slice(2)
        .join('/')
        .includes(data.routeLink.split('/').slice(2).join('/'))
        ? 'active'
        : '';
    } else {
      return this.router.url
        .split('/')
        .slice(2)
        .join('/')
        .includes(data.routeLink.split('/').slice(2).join('/'))
        ? 'active'
        : '';
    }
  }

  shrinkItems(item: INavBar): void {
    if (!this.multiple) {
      for (const modelItem of this.navData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
  }
}
