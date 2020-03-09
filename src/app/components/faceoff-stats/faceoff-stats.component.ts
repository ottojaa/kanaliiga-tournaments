import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ToornamentsService } from 'src/app/toornaments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Animations } from 'src/app/utilities/animations';
import { Match, Team } from 'src/app/interfaces/faceoff';
import { FaceoffService } from 'src/app/faceoff.service';
import { take } from 'rxjs/operators';

/**
 * Component used to show player stats in the data-table after the parser has succeeded.
 * Probably this can be reused for both data updating and just viewing purposes.
 * TODO: Route guard so that only maintainers may edit the data.
 */
@Component({
  selector: 'app-faceoff-stats',
  templateUrl: './faceoff-stats.component.html',
  styleUrls: ['./faceoff-stats.component.scss'],
  animations: [Animations.enterAnimation(), Animations.listAnimations()],
})
export class FaceoffStatsComponent implements OnInit {
  dataSource: any;
  teamScores: any;
  averageScores = [];

  // Used for routing on page refresh
  matchId: string;
  tournamentId: string;
  stageId: string;

  loading = false;
  matches = [];

  constructor(private activatedRoute: ActivatedRoute, private faceoffService: FaceoffService, private router: Router) {
    this.tournamentId = this.activatedRoute.params['_value']['id'];
    this.stageId = this.activatedRoute.params['_value']['stageId'];
    this.matchId = this.activatedRoute.params['_value']['faceoffId'];
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.loading = true;
    this.faceoffService
      .getFaceoff(this.matchId)
      .pipe(take(1))
      .subscribe(
        response => {
          const matches = response.data.matches;
          if (matches) {
            this.dataSource = [...this.createDataTables(matches)];
            this.teamScores = [...this.createTeamScoreArrays(matches)];
            this.averageScores = this.getAverageStats(matches);
          }
          this.loading = false;
        },
        err => {
          this.loading = false;
          console.error('Could not retrieve faceoff:', err);
        }
      );
  }

  navigateBack(navigation: string): void {
    const url =
      navigation === 'matches'
        ? `/tournaments/${this.tournamentId}/stages/${this.stageId}/matches`
        : `/tournaments/${this.tournamentId}/stages/`;
    this.router.navigate([url]);
  }

  /**
   * Groups teams by the match.
   * The first team will get pushed to the match array, the second one will be added to the former.
   */
  createDataTables(matches: Match[]): any[] {
    const matchArr = [];
    matches.forEach((match: Match, matchIndex: number) => {
      match.teams.forEach((team: Team, index: number) => {
        if (index % 2 === 0) {
          matchArr.push(team.players);
        } else {
          matchArr[index + matchIndex - 1] = [...matchArr[index + matchIndex - 1], ...team.players];
        }
      });
    });
    return matchArr;
  }

  // Used for displaying each team's match score on top of the player score data table
  createTeamScoreArrays(matches: Match[]): any[] {
    const teamScoreArr = [];
    matches.forEach((match: Match, matchIndex: number) => {
      match.teams.forEach((team: Team, index: number) => {
        if (index % 2 === 0) {
          const { score, name, result } = team;
          teamScoreArr.push([{ score: score, name: name, result: result }]);
        } else {
          const { score, name, result } = team;
          teamScoreArr[index + matchIndex - 1] = [
            ...teamScoreArr[index + matchIndex - 1],
            ...[{ score: score, name: name, result: result }],
          ];
        }
      });
    });
    return teamScoreArr;
  }

  /**
   * Not used for now
   */
  getAverageStats(matches: Match[]): any[] {
    const playerStats = [];
    matches.forEach(match => {
      match.teams.forEach(team => {
        team.players.forEach(player => {
          const index = playerStats.findIndex(stats => stats.name === player.name);
          if (index > -1) {
            const { goals, assists, saves, shots, score } = playerStats[index];
            const newStats = {
              goals: (goals + player.goals) / 2,
              assists: (assists + player.assists) / 2,
              saves: (saves + player.saves) / 2,
              shots: (shots + player.shots) / 2,
              score: (score + player.score) / 2,
            };
            playerStats[index] = { ...playerStats[index], ...newStats };
          } else {
            playerStats.push(player);
          }
        });
      });
    });
    return playerStats;
  }
}
