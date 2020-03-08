import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';
import { take } from 'rxjs/operators';
import { MatSnackBar, MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  formOtp: FormGroup;

  accountNotFound = false;
  otpNotConfirmed = false;
  otpInvalid: boolean;
  formSubmitAttempt: boolean;
  returnUrl: string;
  loading: boolean;

  password: string;
  email: string;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.email],
      password: ['', Validators.required],
    });
    this.formOtp = this.fb.group({
      otp: ['', Validators.required],
    });
  }

  /**
   * If the user's credentials are correct, log in the user. If the credentials are incorrect, show them an error.
   * If they have not yet confirmed their account, request them to do so.
   */
  async onSubmit() {
    this.formSubmitAttempt = false;
    this.loading = true;
    if (this.form.valid) {
      const payload = {
        email: this.email,
        password: this.password,
      };
      this.auth
        .login(payload)
        .pipe(take(1))
        .subscribe(
          data => {
            this.snackbar.open('Logged in succesfully.', 'close', { duration: 3000 });
            this.auth.updateStorage(data);
            this.dialogRef.close();
            this.loading = false;
          },
          err => {
            this.loading = false;
            if (err.error.data.errorCode === 1) {
              this.snackbar.open('Invalid credentials.', 'close', { duration: 3000 });
              this.accountNotFound = true;
            } else if (err.error.data.errorCode === 2) {
              this.snackbar.open('Check your email for a one time password', 'close', { duration: 3000 });
              this.otpNotConfirmed = true;
            }
          }
        );
    }
  }

  /**
   * User is required to confirm a one time password sent to their email, should (?) alleviate users' account creation sprees
   */
  verifyOTP(): void {
    const payload = {
      email: this.email,
      password: this.password,
      otp: this.formOtp.get('otp').value,
    };
    this.auth
      .verifyOtp(payload)
      .pipe(take(1))
      .subscribe(
        data => {
          this.dialogRef.close();
          this.snackbar.open(data.message, 'close', { duration: 3000 });
          this.auth.updateStorage(data);
        },
        err => {
          this.snackbar.open(err.error.message, 'close', { duration: 3000 });
        }
      );
  }

  resendOTP(): void {
    const payload = {
      email: this.email,
    };
    this.auth
      .resendOTP(payload)
      .pipe(take(1))
      .subscribe(
        data => {
          console.log(data);
          this.snackbar.open('Email sent.', 'close', { duration: 3000 });
        },
        err => {
          this.snackbar.open(err.error.message, 'close', { duration: 3000 });
        }
      );
  }

  discordAuth(): void {
    this.auth
      .discordAuth()
      .pipe(take(1))
      .subscribe(response => {
        window.location.href = response.data;
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
