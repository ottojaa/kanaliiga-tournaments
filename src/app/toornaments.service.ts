import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TeamRanking, Group, Stage, TeamParticipant, Tournament } from './interfaces/tournament';



@Injectable({
  providedIn: 'root',
})
export class ToornamentsService {
  public participants$: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient) {}

  getPlaylistData(): Observable<Tournament[]> {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'tournaments=0-49',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url =
      environment.apiUrl + '/viewer/v2/playlists/' + environment.playlist + '/tournaments?sort=scheduled_desc';
    return this.http.get<Tournament[]>(url, requestOptions);
  }

  getTournamentMatches(tournamentId: string): Observable<Group[]> {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'matches=0-127',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/matches';
    return this.http.get<Group[]>(url, requestOptions);
  }

  getTournamentRounds(tournamentId: string): any {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'rounds=0-49',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/rounds';
    return this.http.get(url, requestOptions);
  }

  getTournamentGroups(tournamentId: string): any {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'groups=0-49',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/groups';
    return this.http.get(url, requestOptions);
  }

  getTournamentStages(tournamentId: string): Observable<Stage[]> {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/stages';
    return this.http.get<Stage[]>(url, requestOptions);
  }

  getTournamentStage(stageId: string, tournamentId: string): Observable<{ id: string }> {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/stages/' + stageId;
    return this.http.get<{ id: string }>(url, requestOptions);
  }

  getTournamentRankings(stageId: string, tournamentId: string): Observable<TeamRanking[]> {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'items=0-49'
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/stages/' + stageId + '/ranking-items';
    return this.http.get<TeamRanking[]>(url, requestOptions);
  }

  getParticipants(tournamentId: string): Observable<TeamParticipant[]> {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'participants=0-49',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/participants';
    return this.http.get<TeamParticipant[]>(url, requestOptions);
  }

  getParticipant(participantId: string, tournamentId: string): Observable<TeamParticipant> {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'participants=0-49',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/participants/' + participantId;
    return this.http.get<TeamParticipant>(url, requestOptions);
  }

  getMoreInformation(tournamentId: string): any {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId;
    return this.http.get(url, requestOptions);
  }
}
