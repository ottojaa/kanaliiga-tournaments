import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Faceoff, Player } from './interfaces/faceoff';
import { Observable } from 'rxjs';

export interface FaceoffResponse {
  data: Faceoff;
}

export interface PlayerStats {
  total: Player[];
  average: Player[];
}

export interface PlayerStatsResponse {
  data: PlayerStats;
}

@Injectable({
  providedIn: 'root',
})
export class FaceoffService {
  testUrl = 'http://localhost:5000/api';
  baseUrl = 'https://kanaliiga-tournaments-api.herokuapp.com/api';
  url: string;

  constructor(private http: HttpClient) {
    this.url = this.baseUrl;
  }

  uploadFaceOff(payload: Faceoff): Observable<any> {
    const url = this.url + '/faceoff';
    let headers = new HttpHeaders();
    headers = headers.append('content-type', 'application/json');
    return this.http.post(url, payload, { headers: headers });
  }

  uploadReplays(files: any, faceoffId: string): Observable<any> {
    const url = this.url + '/faceoff/replays/' + faceoffId;
    return this.http.post(url, files);
  }

  deleteFaceoff(id: string): Observable<any> {
    const url = this.url + '/faceoff/' + id;
    return this.http.delete(url);
  }

  getFaceoffIds(stageId: string): Observable<{ data: string[] }> {
    const url = this.url + '/faceoff?stageId=' + stageId;
    return this.http.get<{ data: string[] }>(url);
  }

  getPlayerStats(stageId: string): Observable<PlayerStatsResponse> {
    const url = this.url + '/faceoff/player-stats?stageId=' + stageId;
    return this.http.get<PlayerStatsResponse>(url);
  }

  parseReplays(file: any, matchId: string, tournamentId): Observable<any> {
    const url = this.url + `/faceoff/parse/v2/?matchId=${matchId}&tournamentId=${tournamentId}`;
    return this.http.post(url, file, { reportProgress: true, observe: 'events' });
  }

  getReplaysForMatch(matchId: string): Observable<any> {
    const url = this.url + '/faceoff/replays?matchId=' + matchId;
    return this.http.get(url);
  }

  getFaceoffForStage(stageId: string): Observable<any> {
    const url = this.url + '/faceoff/stage-matches?stageId=' + stageId;
    return this.http.get(url);
  }

  getTeamStatsForStage(stageId: string): Observable<any> {
    const url = this.url + '/faceoff/team-stats?stageId=' + stageId;
    return this.http.get(url);
  }

  getFaceoff(id: string): Observable<FaceoffResponse> {
    const url = this.url + '/faceoff/' + id;
    return this.http.get<FaceoffResponse>(url);
  }
}
