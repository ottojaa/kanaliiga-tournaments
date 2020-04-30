import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeamsService } from 'src/app/teams.service';
import { ActivatedRoute } from '@angular/router';
import { ToornamentsService } from 'src/app/toornaments.service';
import { switchMap, tap, map, takeUntil, share } from 'rxjs/operators';
import { of, Observable, forkJoin, Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Animations } from 'src/app/utilities/animations';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  animations: [Animations.listAnimations()],
})
export class TeamComponent implements OnInit, OnDestroy {
  teamId: string;
  container$: Observable<any>;
  teamInformation$: Observable<any>;
  teamStats: any;

  ranks = [
    'B1',
    'B2',
    'B3',
    'S1',
    'S2',
    'S3',
    'G1',
    'G2',
    'G3',
    'P1',
    'P2',
    'P3',
    'D1',
    'D2',
    'D3',
    'C1',
    'C2',
    'C3',
    'GC',
  ];
  loading = true;
  noData = false;
  destroy$ = new Subject();

  constructor(
    private teamService: TeamsService,
    private activatedRoute: ActivatedRoute,
    private toornamentService: ToornamentsService,
    private _location: Location
  ) {
    this.teamId = this.activatedRoute.params['_value']['id'];
  }

  ngOnInit(): void {
    this.teamInformation$ = this.getTeamInformation().pipe(
      takeUntil(this.destroy$),
      tap(data => {
        this.noData = Object.values(data).every(el => !el);
      })
    );
    this.teamInformation$.subscribe(data => console.log(data));
  }

  getTeamInformation(): Observable<any> {
    return this.teamService.getTeamById(this.teamId).pipe(
      switchMap(response => {
        const matches = response.data['Team'];
        if (matches && matches.length) {
          this.createAverageStats(matches);
          const tournamentId = matches[0].tournamentId;
          const stageId = matches[0].stageId;
          return forkJoin([
            of(matches).pipe(tap(data => (this.teamStats = this.createAverageStats(data)))),
            this.toornamentService.getParticipant(this.teamId, tournamentId),
            this.toornamentService.getTournamentStage(stageId, tournamentId),
          ]);
        }
        return of([]);
      }),
      map(data => ({ matches: data[0], teamInfo: data[1], stageInfo: data[2] })),
      tap(() => (this.loading = false))
    );
  }

  createAverageStats(matches: any): any {
    const result = {
      faceoffWins: 0,
      faceoffLosses: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesPlayed: 0,
      winPercentage: '',
    };
    if (matches && matches.length) {
      matches.forEach(match => {
        match.participants.forEach(participant => {
          if (participant.participant[0].id === this.teamId) {
            result.gamesWon += participant.score;
            if (participant.result === 'win') {
              result.faceoffWins += 1;
            } else {
              result.faceoffLosses += 1;
            }
          } else {
            result.gamesLost += participant.score;
          }
        });
        result.gamesPlayed += 1;
      });
    }
    result.winPercentage = this.getWinPercentage(result.faceoffWins, result.gamesPlayed);
    return result;
  }

  getWinPercentage(won: number, played: number): string {
    if (!won || !played) {
      return '0';
    }
    return ((won / played) * 100).toFixed().toString();
  }

  goBack(): void {
    this._location.back();
  }

  validateSteamId(id: string): boolean {
    const pattern = /^[0-9]{17}$/;
    return pattern.test(id);
  }

  validateRank(rank: string): boolean {
    return this.ranks.includes(rank);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
