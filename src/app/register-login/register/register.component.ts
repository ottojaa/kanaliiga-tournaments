import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkStepper, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { AuthService } from 'src/app/auth.service';
import { take } from 'rxjs/operators';
import { MatSnackBar, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class RegisterComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  email: string;
  username: string;
  password: string;
  loading = false;
  showDiscord = true;

  emailTaken = false;

  constructor(
    private dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      mailCtrl: ['', [Validators.required, Validators.email]],
    });
    this.secondFormGroup = this._formBuilder.group({
      nameCtrl: ['', Validators.required],
      passwordCtrl: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  checkEmail(stepper: CdkStepper) {
    this.loading = true;
    this.auth.checkExistingEmail(this.email).subscribe(
      response => {
        if (!response.data.taken) {
          this.showDiscord = false;
          stepper.next();
        } else {
          this.snackbar.open('This email is taken.', 'close', { duration: 3000 });
        }
        this.loading = false;
      },
      err => {
        console.error(err);
        this.loading = false;
        this.snackbar.open('Could not retrieve response from the serve');
      }
    );
  }

  register(stepper: CdkStepper) {
    const payload = {
      username: this.username,
      email: this.email,
      password: this.password,
    };
    this.loading = true;
    this.auth.register(payload).subscribe(
      response => {
        if (!response.data.taken) {
          stepper.next();
        } else {
          this.snackbar.open('This username is taken.', 'close', { duration: 3000 });
        }
        this.loading = false;
      },
      err => {
        let msg = 'Please try again later.';
        this.loading = false;
        if (err.error.data && err.error.data[0].msg) {
          msg = err.error.data[0].msg;
        }
        this.snackbar.open(msg, 'close', { duration: 3000 });
      }
    );
  }

  closeDialog(openLogin?: boolean): void {
    this.dialogRef.close(openLogin);
  }

  firstStepHasErrors(): any {
    return (
      this.firstFormGroup.get('mailCtrl').hasError('email') && this.firstFormGroup.get('mailCtrl').hasError('required')
    );
  }

  discordAuth(): void {
    this.snackbar.open('Disabled for the time being due to Discord Oauth2-implementation changes.', 'close', { duration: 3000 });
    /* this.auth.discordAuth().subscribe(response => {
      window.location.href = response.data;
    }); */
  }

  secondStepHasErrors(): any {
    return (
      this.secondFormGroup.get('nameCtrl').hasError('required') &&
      this.secondFormGroup.get('passwordCtrl').hasError('required') &&
      this.secondFormGroup.get('passwordCtrl').hasError('minlength')
    );
  }
}
