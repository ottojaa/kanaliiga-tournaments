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
  participants = [];

  // Used for routing on page refresh
  matchId: string;
  tournamentId: string;
  stageId: string;
  date: string;

  loading = false;
  matches = [];
  overviewScores;

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
            this.participants = response.data.participants;
            this.date = response.data.date;
            this.dataSource = [...this.createDataTables(matches)];
            this.teamScores = [...this.createTeamScoreArrays(matches)];
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
    this.overviewScores = { ...this.createOverview(matchArr) };
    return matchArr;
  }

  // This is what hangover code looks like
  createOverview(matches: any[]): any {
    let amount = 0;
    const overview = [];
    matches.forEach(match => {
      match.forEach(player => {
        const index = overview.findIndex(stat => stat.name === player.name);
        if (index === -1) {
          overview.push(player);
        } else {
          overview[index] = {
            ...overview[index],
            assists: overview[index].assists + player.assists,
            score: overview[index].score + player.score,
            goals: overview[index].goals + player.goals,
            saves: overview[index].saves + player.saves,
            shots: overview[index].shots + player.shots,
          };
        }
      });
      amount++;
    });
    const final = overview.map(player => {
      let percentage = '0.0%';
      if (player.goals && player.shots) {
        percentage = this.getShotPercentage((player.goals / player.shots) * 100);
      }
      return {
        ...player,
        goals: (player.goals / amount).toFixed(1).toString(),
        shots: (player.shots / amount).toFixed(1).toString(),
        saves: (player.saves / amount).toFixed(1).toString(),
        assists: (player.assists / amount).toFixed(1).toString(),
        score: (player.score / amount).toFixed(1).toString(),
        shootingPercentage: percentage,
      };
    });

    const team_one_name = final[0].teamName;
    const team_one = final.filter(player => player.teamName === team_one_name);
    const team_two = final.filter(player => player.teamName !== team_one_name);
    const participant_one = this.participants.find(participant => participant.participant[0].name === team_one_name);
    const participant_two = this.participants.find(participant => participant.participant[0].name !== team_one_name);
    return { teamOne: team_one, teamTwo: team_two, participantOne: participant_one, participantTwo: participant_two };
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

  getShotPercentage(shootingPercentage: number): string {
    return shootingPercentage.toFixed(1).toString() + '%';
  }
}
