import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  testUrl = 'http://localhost:5000/api';
  baseUrl = 'https://kanaliiga-tournaments-api.herokuapp.com/api';
  url: string;

  constructor(private http: HttpClient) {
    this.url = this.testUrl;
  }

  getTeamById(teamId: string): Observable<any> {
    const url = this.url + `/teams/?teamId=${teamId}`;
    return this.http.get(url);
  }
}
