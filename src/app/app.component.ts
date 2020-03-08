import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public router: Router, private auth: AuthService) {
    const token = new URL(location.href).searchParams.get('code');
    if (token) {
      this.auth.loading$.next(true);
      this.auth
        .discordLogin(token)
        .pipe(take(1))
        .subscribe(
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

  title = 'kanaliiga-stats';
}
