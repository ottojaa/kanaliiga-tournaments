import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ToornamentsService {
  public participants$: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient) {}

  getPlaylistData(): Observable<any> {
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
    return this.http.get(url, requestOptions);
  }

  getTournamentMatches(tournamentId: string): any {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'matches=0-127',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/matches';
    return this.http.get(url, requestOptions);
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

  getTournamentStages(tournamentId: string): any {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/stages';
    return this.http.get(url, requestOptions);
  }

  getParticipants(tournamentId: string): any {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'participants=0-49',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/participants';
    return this.http.get(url, requestOptions);
  }

  getParticipant(participantId: string, tournamentId: string): any {
    const headerDict = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Range: 'participants=0-49',
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const url = environment.apiUrl + '/viewer/v2/tournaments/' + tournamentId + '/participants/' + participantId;
    return this.http.get(url, requestOptions);
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
