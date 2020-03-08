import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  testUrl = 'http://localhost:5000/api';
  baseUrl = 'https://kanaliiga-tournaments-api.herokuapp.com/api';
  url: string;

  public loading$ = new BehaviorSubject<boolean>(false);
  public currentUserData$: BehaviorSubject<any>;
  public currentUser$ = new Observable<User>();

  constructor(private http: HttpClient) {
    this.url = this.baseUrl;
    this.currentUserData$ = new BehaviorSubject<any>(null);

    const user = localStorage.getItem('userData');
    if (user && user !== 'undefined' && typeof user !== null) {
      try {
        this.currentUserData$.next(JSON.parse(user));
      } catch (err) {
        console.error('JSON parse failed: ', user);
      }
    }
    this.currentUser$ = this.currentUserData$.asObservable();
  }

  checkExistingEmail(email: string): Observable<any> {
    const url = this.url + '/auth/validate-email?email=' + email;
    return this.http.get(url);
  }

  checkExistingUsername(username: string): Observable<any> {
    const url = this.url + '/auth/validate-username?=' + username;
    return this.http.get(url);
  }

  register(payload: any): Observable<any> {
    const url = this.url + '/auth/register';
    return this.http.post(url, payload);
  }

  login(payload: any): Observable<any> {
    const url = this.url + '/auth/login';
    return this.http.post(url, payload);
  }

  logout(): void {
    localStorage.removeItem('userData');
    this.currentUserData$.next(null);
  }

  verifyOtp(payload: any): Observable<any> {
    const url = this.url + '/auth/verify-otp';
    return this.http.post(url, payload);
  }

  resendOTP(payload: any): Observable<any> {
    const url = this.url + '/auth/resend-verify-otp';
    return this.http.post(url, payload);
  }

  updateStorage(userData: any): any {
    localStorage.setItem('userData', JSON.stringify(userData.data));
    this.currentUserData$.next(userData.data);
    console.log(this.currentUserData$.getValue());
  }

  discordAuth(): Observable<any> {
    const url = this.url + '/auth/discord-auth';
    return this.http.get(url);
  }

  discordLogin(code: string): Observable<any> {
    const url = this.url + '/auth/discord-callback?code=' + code;
    return this.http.get(url);
  }
}

export interface User {
  username: string;
  token: string;
}
