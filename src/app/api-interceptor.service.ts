import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable()
export class ApiInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({ headers: req.headers.set('X-Api-Key', environment.apiKey) });

    const userData = localStorage.getItem('userData');

    // Only use JWT authorization for our own backend, as toornament thinks we're trying to use a fabricated "organizer" token
    if (userData && userData !== 'undefined' && !req.url.includes('api.toornament')) {
      try {
        const idToken = JSON.parse(userData);
        const cloned = authReq.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + idToken.token),
        });

        return next.handle(cloned);
      } catch (err) {
        console.error('JSON parse failed:', userData);
      }
    }
    return next.handle(authReq);
  }
}
