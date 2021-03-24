import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeamsService } from 'src/app/teams.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToornamentsService } from 'src/app/toornaments.service';
import { switchMap, tap, map, takeUntil } from 'rxjs/operators';
import { of, Observable, forkJoin, Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Animations } from 'src/app/utilities/animations';
import { isEmpty } from 'lodash';
import { Player, Faceoff, Match } from 'src/app/interfaces/faceoff';
import { FaceoffResult, RLPlayer, Stats, TeamInformation } from 'src/app/interfaces/teams';
import { Participants } from 'src/app/interfaces/participants';

interface TeamInformationContainer {
  matches: Faceoff;
  stageInfo: { id: string };
  teamInfo: Participants;
  teamStats: Stats;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  animations: [Animations.listAnimations()],
})
export class TeamComponent implements OnInit, OnDestroy {
  teamId: string;
  teamInformation$: Observable<TeamInformationContainer>;
  teamStats: FaceoffResult;

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
  ) {
    this.teamId = this.activatedRoute.params['_value']['id'];
  }

  ngOnInit(): void {
    this.teamInformation$ = this.getTeamInformation().pipe(
      takeUntil(this.destroy$),
      tap(data => { this.noData = Object.values(data).every(el => !el); })
    );
  }

  getTeamInformation(): Observable<TeamInformationContainer> {
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
      map(([matches, teamStats, teamInfo, stageInfo]) => (<TeamInformationContainer>{ matches, teamStats, teamInfo, stageInfo })),
      tap(() => this.loading = false )
    );
  }

  /**
   * Filters total and average stats by either the player's steam_id (if present), or player's name
   */
  getPlayerStats(player: RLPlayer, stats: Stats): Stats | null {
    if (!isEmpty(stats) && player) {
      try {
        const getSteamIdFromTrackerlink = (link: string) => {
          const urlParts = link.split('/');
          if (urlParts.includes('rocketleague.tracker.network') && urlParts.length >= 7) {
            return urlParts[6];
          }

          return null;
        };

        const filterStatsByOnlineIdOrName = (playerEntity: RLPlayer, stat: Player) => {
          const steam_id = getSteamIdFromTrackerlink(playerEntity.custom_fields?.rl_tracker_link);
          const pattern = /^[0-9]{17}$/;
          const steam_id_valid = pattern.test(steam_id);

          if (steam_id_valid) {
            // The binary parser unfortunately is not 100% accurate when it comes to steam_id, so we need to omit the 2 last digits
            return stat.onlineId.substring(0, 15) === steam_id.substring(0, 15);
          }
          // fallback in case user does not have steam_id
          return stat.name === playerEntity.name;
        };
        return {
          total: stats['total'].filter(stat => filterStatsByOnlineIdOrName(player, stat)),
          average: stats['average'].filter(stat => filterStatsByOnlineIdOrName(player, stat)),
        };
      } catch (err) {
        console.log(err);
      }
    }
    return null;
  }

  createAverageStats(matches: Faceoff[]): FaceoffResult {
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

  validateRank(rank: string): boolean {
    return this.ranks.includes(rank);
  }

  goToFaceoff(faceoff: Faceoff): void {
    const { matchId, tournamentId, stageId } = faceoff;
    const url = `/tournaments/${tournamentId}/stages/${stageId}/faceoff/`;
    this.router.navigate([url, matchId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
