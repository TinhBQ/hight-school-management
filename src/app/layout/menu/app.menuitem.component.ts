/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { INavBar } from '../DTOs/INavBar';
import { fadeInOut } from 'src/app/helper/animations';

@Component({
  selector: 'app-menuitem',
  template: `<ng-container>
    <ul
      class="sublevel-nav"
      *ngIf="collapsed && data.items && data.items.length > 0"
      [ngClass]="{ 'expended-sublevel': expanded }"
      [@submenu]="
        expanded
          ? {
              value: 'visible',
              params: {
                transitionParams: '100ms cubic-bezier(0.86, 0, 0.07, 1)',
                height: '*'
              }
            }
          : {
              value: 'hidden',
              params: {
                transitionParams: '100ms cubic-bezier(0.86, 0, 0.07, 1)',
                height: '0'
              }
            }
      ">
      <li class="sublevel-nav-item" *ngFor="let item of data.items">
        <a
          class="sublevel-nav-link"
          (click)="handleClick(item)"
          *ngIf="item.items && item.items.length > 0"
          [ngClass]="getActiveClass(item)">
          <i class="sublevel-nav-icon" [class]="item.icon"></i>
          <span class="sublevel-nav-link-text" @fadeInOut *ngIf="collapsed">
            {{ item.label }}
          </span>
          <i
            *ngIf="item.items && collapsed"
            class="sublevel-collapse-icon"
            [ngClass]="
              !item.expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'
            "></i>
        </a>

        <a
          class="sublevel-nav-link"
          *ngIf="!item.items || (item.items && item.items.length === 0)"
          [routerLink]="[item.routeLink]"
          routerLinkActive="active-sublevel"
          [routerLinkActiveOptions]="{ exact: true }">
          <i class="sublevel-nav-icon" [class]="item.icon"></i>
          <span class="sublevel-nav-link-text" @fadeInOut *ngIf="collapsed">
            {{ item.label }}
          </span>
        </a>

        <div *ngIf="item.items && item.items.length > 0">
          <app-menuitem
            [data]="item"
            [collapsed]="collapsed"
            [multiple]="multiple"
            [expanded]="item.expanded"></app-menuitem>
        </div>
      </li>
    </ul>
  </ng-container>`,
  animations: [
    fadeInOut,
    trigger('submenu', [
      state(
        'hidden',
        style({
          height: '0',
          overflow: 'hidden',
        })
      ),
      state(
        'visible',
        style({
          height: '*',
        })
      ),
      transition('visible <=> hidden', [
        style({ overflow: 'hidden' }),
        animate('{{transitionParams}}'),
      ]),
      transition('void => *', animate(0)),
    ]),
  ],
})
export class AppMenuItemComponent {
  @Input() data: INavBar = {
    routeLink: '',
    icon: '',
    label: '',
    items: [],
  };
  @Input() collapsed = false;
  @Input() animating: boolean | undefined;
  @Input() expanded: boolean | undefined;
  @Input() multiple = false;

  constructor(public router: Router) {}

  handleClick(item: any): void {
    if (!this.multiple) {
      if (this.data.items && this.data.items.length > 0) {
        for (const modelItem of this.data.items) {
          if (item !== modelItem && modelItem.expanded) {
            modelItem.expanded = false;
          }
        }
      }
    }
    item.expanded = !item.expanded;
  }

  getActiveClass(data: INavBar): string {
    return this.router.url.includes(data.routeLink) ? 'active-sublevel' : '';
  }
}
