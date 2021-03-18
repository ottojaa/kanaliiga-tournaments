import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeamsService } from 'src/app/teams.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToornamentsService } from 'src/app/toornaments.service';
import { switchMap, tap, map, takeUntil } from 'rxjs/operators';
import { of, Observable, forkJoin, Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Animations } from 'src/app/utilities/animations';
import { isEmpty } from 'lodash';

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
  stageId: string;
  tournamentId: string;
  destroy$ = new Subject();

  constructor(
    private teamService: TeamsService,
    private activatedRoute: ActivatedRoute,
    private toornamentService: ToornamentsService,
    private router: Router,
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
  }

  getTeamInformation(): Observable<any> {
    return this.teamService.getTeamById(this.teamId).pipe(
      switchMap(response => {
        const { teamStats, playerStats } = response.data;
        if (teamStats && teamStats.length) {
          this.createAverageStats(teamStats);
          this.tournamentId = teamStats[0].tournamentId;
          this.stageId = teamStats[0].stageId;
          return forkJoin([
            of(teamStats).pipe(tap(data => (this.teamStats = this.createAverageStats(data)))),
            of(playerStats),
            this.toornamentService.getParticipant(this.teamId, this.tournamentId),
            this.toornamentService.getTournamentStage(this.stageId, this.tournamentId),
          ]);
        }
        return of([]);
      }),
      map(data => ({
        matches: data[0],
        teamStats: data[1],
        teamInfo: data[2],
        stageInfo: data[3],
      })),
      tap(() => (this.loading = false))
    );
  }

  getPlayerStats(rl_tracker_id: string, stats: any): any {
    if (!isEmpty(stats) && rl_tracker_id) {
      try {
        const id = this.playerIdParser(rl_tracker_id);
        return {
          total: stats['total'].filter(stat => stat.onlineId.substring(0, 15) === id.substring(0, 15)),
          average: stats['average'].filter(stat => stat.onlineId.substring(0, 15) === id.substring(0, 15)),
        };
      } catch (err) {
        console.log(err);
      }
    }
    return null;
  }

  playerIdParser(id: string): string {
    const test = id.split('/');
    return test[test.length - 2];
  }

  createAverageStats(matches: any): any {
    const result = {
      faceoffWins: 0,
      faceoffLosses: 0,
      gamesWon: 0,
      gamesLost: 0,
      cols: 1,
      rows: 1,
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
    const url = `/tournaments/${this.tournamentId}/stages/${this.stageId}/matches`;
    this.router.navigateByUrl(url);
  }

  validateSteamId(id: string): boolean {
    const pattern = /^[0-9]{17}$/;
    return pattern.test(id);
  }

  validateRank(rank: string): boolean {
    return this.ranks.includes(rank);
  }

  goToFaceoff(match: any): void {
    const { matchId, tournamentId, stageId } = match;
    const url = `/tournaments/${tournamentId}/stages/${stageId}/faceoff/`;
    this.router.navigate([url, matchId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
