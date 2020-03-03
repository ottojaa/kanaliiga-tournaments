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

  public currentUserData$: BehaviorSubject<any>;
  public currentUser$ = new Observable<User>();

  constructor(private http: HttpClient) {
    this.url = this.baseUrl;

    const user = localStorage.getItem('userData');

    this.currentUserData$ = new BehaviorSubject<any>({});

    if (user) {
      this.currentUserData$.next(JSON.parse(user));
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

  updateStorage(userData: any): any {
    localStorage.setItem('userData', JSON.stringify(userData.data));
    this.currentUserData$.next(userData.data);
  }
}

export interface User {
  username: string;
  token: string;
}
