import {
  trigger,
  animate,
  transition,
  style,
  state,
  keyframes,
} from '@angular/animations';

export const largeToSmall = trigger('toggleCollapsed', [
  state(
    'large',
    style({
      opacity: '0',
    })
  ),
  state(
    'small',
    style({
      opacity: '1',
    })
  ),
  transition('large => small', animate('0.35s ease-out')),
]);

export const smallToLarge = trigger('toggleCollapsed', [
  state(
    'large',
    style({
      opacity: '1',
    })
  ),
  state(
    'small',
    style({
      opacity: '0',
    })
  ),
  transition('small => large', animate('0.35s ease-in')),
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('350ms', style({ opacity: 1 })),
  ]),
]);

export const rotate = trigger('rotate', [
  transition(':leave', [
    animate(
      '1000ms',
      keyframes([
        style({
          transform: 'rotate(0deg)',
          offset: '0',
        }),
        style({
          transform: 'rotate(2turn)',
          offset: '1',
        }),
      ])
    ),
  ]),
]);
