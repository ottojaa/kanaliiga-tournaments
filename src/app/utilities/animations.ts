import { trigger, transition, style, animate, query, stagger, animateChild, state } from '@angular/animations';

export const animatedSize = trigger('animatedSize', [
  transition(':enter', [
    style({ height: 0, width: 0 }),
    animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ height: '*', width: '*' })),
  ]),
  transition(':leave', [animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ height: 0, width: 0 }))]),
]);

export class Animations {
  static enterAnimation(): any {
    return trigger('animatedSize', [
      transition(':enter', [
        style({ height: 0, width: 0 }),
        animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ height: '*', width: '*' })),
      ]),
      transition(':leave', [animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ height: 0, width: 0 }))]),
    ]);
  }
  static listAnimations(): any[] {
    return [
      trigger('animatedItem', [
        transition(':enter', [
          style({ transform: 'translateX(-10px)', opacity: 0 }),
          animate('0.4s cubic-bezier(.8, -0.6, 0.26, .6)', style({ transform: 'translateX(-0px)', opacity: 1 })),
        ]),
        transition(':leave', [animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ opacity: 0 }))]),
      ]),
      trigger('detailExpand', [
        state('collapsed', style({ height: '0px', minHeight: '0' })),
        state('expanded', style({ height: '*' })),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
      trigger('animatedOpacity', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ opacity: 1 })),
        ]),
        transition(':leave', [animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ opacity: 0 }))]),
      ]),
      trigger('animatedList', [
        transition('* => *', [query(':enter', [stagger(35, animateChild())], { optional: true })]),
        transition(':enter', [
          style({ opacity: 0 }),
          animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ opacity: 1 })),
        ]),
        transition(':leave', [animate('400ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ opacity: 0 }))]),
      ]),
      trigger('animatedItemSliding', [
        transition(':enter', [
          style({
            transform: 'translate3d(0, 75px, 0)',
            opacity: 0,
          }),
          animate(
            '0.8s cubic-bezier(0.25, 0.69, 0.41, 1.01)',
            style({
              transform: 'translate3d(0, 0, 0)',
              opacity: 1,
            })
          ),
        ]),
      ]),
      trigger('animatedListSliding', [
        transition('* => *', [
          query('@animatedItemSliding', [stagger(25, [animateChild()])], {
            optional: true,
          }),
        ]),
      ]),
      trigger('slideInOut', [
        transition(':enter', [
          style({ transform: 'translateY(-100%)' }),
          animate('200ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ transform: 'translateY(0%)' })),
        ]),
        transition(':leave', [
          animate('200ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ transform: 'translateY(-100%)' })),
        ]),
      ]),
    ];
  }

  static elementAnimations(): any[] {
    return [
      trigger('slideInOut', [
        transition(':enter', [
          style({ transform: 'translateX(50px)', opacity: 0 }),
          animate('700ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ transform: 'translateX(0%)', opacity: 1.0 })),
        ]),
        transition(':leave', [
          animate('700ms cubic-bezier(0.25, 0.69, 0.41, 1.01)', style({ transform: 'translateX(20px)', opacity: 0 })),
        ]),
      ]),
      trigger('slideInOutFromUp', [
        transition(':enter', [
          style({ transform: 'translateY(-150px)', opacity: 0 }),
          animate('400ms ease-in', style({ transform: 'translateY(0%)', opacity: 1 })),
        ]),
        transition(':leave', [animate('400ms ease-in', style({ transform: 'translateY(-150px)', opacity: 0 }))]),
      ]),
      trigger('collapseColumn', [
        transition(':enter', [style({ opacity: 0 }), animate('0.4s ease-in-out', style({ opacity: 1 }))]),
        transition(':leave', [style({ opacity: 1 }), animate('0.4s ease-in-out', style({ opacity: 0 }))]),
      ]),
    ];
  }
}
