import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('drawer', { static: false })
  drawer: MatSidenav;
  title = 'kanaliiga-stats';
  drawerOpen = false;
  menuItems = [
    {
      icon: 'warning',
      text: 'Sidemenu is WIP...',
      color: 'warn',
      route: '/asdks',
    },
    {
      icon: 'warning',
      text: '...and does nothing atm',
      color: 'warn',
      route: '/eiiii',
    },
    {
      icon: 'list',
      text: 'Teams',
      route: '/teams',
    },
    {
      icon: 'sports_esports',
      text: 'Players',
      route: '/players',
    },
    {
      icon: 'category',
      text: 'Stages',
      route: '/stages',
    },
  ];

  constructor(public router: Router, private auth: AuthService) {
    const token = new URL(location.href).searchParams.get('code');
    if (token) {
      this.auth.loading$.next(true);
      this.auth.discordLogin(token).subscribe(
        userData => {
          this.auth.updateStorage(userData);
          this.auth.loading$.next(false);
        },
        err => {
          this.auth.loading$.next(false);
          console.error(err);
        }
      );
    }
  }

  toggleDrawer(): void {
    this.drawer.toggle();
    this.drawerOpen = !this.drawerOpen;
  }
}
