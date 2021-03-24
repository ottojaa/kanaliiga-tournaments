import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamInformation } from '../app/interfaces/teams';

type TeamInformationResponse = { data: TeamInformation };
@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  testUrl = 'http://localhost:5000/api';
  baseUrl = 'https://kanaliiga-tournaments-api.herokuapp.com/api';
  url: string;

  constructor(private http: HttpClient) {
    this.url = this.baseUrl;
  }

  getTeamById(teamId: string): Observable<TeamInformationResponse> {
    const url = this.url + `/teams/?teamId=${teamId}`;
    return this.http.get<TeamInformationResponse>(url);
  }
}
