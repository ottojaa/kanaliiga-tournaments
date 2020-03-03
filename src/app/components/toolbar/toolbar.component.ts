import { Component } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { RegisterComponent } from 'src/app/register-login/register/register.component';
import { LoginComponent } from 'src/app/register-login/login/login.component';
import { AuthService } from 'src/app/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  animations: [
    trigger('animatedItemSliding', [
      transition(':enter', [
        style({
          transform: 'translate3d(75px, 0, 0)',
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
      transition(':leave', [
        style({
          transform: 'translate3d(-75px, 0, 0)',
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
  ],
})
export class ToolbarComponent {
  routeDictionary = ['tournaments', 'stages'];

  currentBreadCrumbs = [];

  constructor(public dialog: MatDialog, public auth: AuthService, private snackbar: MatSnackBar) {}

  openSignUp(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: '600px',
      height: '450px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openSignIn();
      }
    });
  }

  openSignIn(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe();
  }

  logout(): void {
    this.auth.logout();
    this.snackbar.open('Logged out succesfully.', 'close', { duration: 3000 });
  }
}
