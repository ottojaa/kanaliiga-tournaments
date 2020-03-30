import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Faceoff } from './interfaces/faceoff';
import { Observable } from 'rxjs';

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

  deleteFaceoff(id: string): Observable<any> {
    const url = this.url + '/faceoff/' + id;
    return this.http.delete(url);
  }

  getFaceoffIds(stageId: string): Observable<string[] | any> {
    const url = this.url + '/faceoff?stageId=' + stageId;
    return this.http.get(url);
  }

  getPlayerStats(stageId: string): Observable<any> {
    const url = this.url + '/faceoff/player-stats?stageId=' + stageId;
    return this.http.get(url);
  }

  parseReplays(file: any): Observable<any> {
    const url = this.url + '/faceoff/parse';
    return this.http.post(url, file, { reportProgress: true, observe: 'events' });
  }

  getFaceoffForStage(stageId: string): Observable<any> {
    const url = this.url + '/faceoff/stage-matches?stageId=' + stageId;
    return this.http.get(url);
  }

  getTeamStatsForStage(stageId: string): Observable<any> {
    const url = this.url + '/faceoff/team-stats?stageId=' + stageId;
    return this.http.get(url);
  }

  getFaceoff(id: string): Observable<any> {
    const url = this.url + '/faceoff/' + id;
    return this.http.get(url);
  }
}
