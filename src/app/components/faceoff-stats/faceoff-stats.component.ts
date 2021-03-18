import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animations } from 'src/app/utilities/animations';
import { Team, Player, Faceoff, Participant,
  MatchStatistics, PlayerOverviewsPerTeam, PlayerList,
  PlayerOverviewRepresentation, ParticipantInformation } from 'src/app/interfaces/faceoff';
import { FaceoffService } from 'src/app/faceoff.service';
import { finalize, map } from 'rxjs/operators';
import { omit, pick, cloneDeep } from 'lodash';

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
  dataSource: MatchStatistics[];
  participants: Participant[] = [];

  // Used for routing on page refresh
  matchId: string;
  tournamentId: string;
  stageId: string;
  date: string;
  statProperties: string[] = ['score', 'assists', 'goals', 'saves', 'shots'];

  loading = false;
  overviewScores: PlayerOverviewsPerTeam;

  constructor(
    private activatedRoute: ActivatedRoute,
    private faceoffService: FaceoffService,
    private router: Router
  ) {
    this.tournamentId = this.activatedRoute.params['_value']['id'];
    this.stageId = this.activatedRoute.params['_value']['stageId'];
    this.matchId = this.activatedRoute.params['_value']['faceoffId'];
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.loading = true;

    this.faceoffService.getFaceoff(this.matchId)
      .pipe(
        map((response) => this.mapFaceoffDataToUIRepresentation(response.data)),
        finalize(() => this.loading = false))
      .subscribe(faceoff => {
        const { matchStatistics, overview } = faceoff;
        this.dataSource = matchStatistics;
        this.overviewScores = overview;
      }, err => {
        console.error('Could not retrieve faceoff:', err);
      }
    );
  }

  mapFaceoffDataToUIRepresentation(faceoff: Faceoff): { matchStatistics: MatchStatistics[], overview: PlayerOverviewsPerTeam} {
    const { matches, participants} = faceoff;
    const teams = matches.map((match) => match.teams);
    const matchStatistics = this.getMatchStatistics(teams);
    const totalPlayerScoreList = this.getTotalPlayerScoreList(teams);
    const overview = this.getOverviewsPerTeam(totalPlayerScoreList, participants);

    return { matchStatistics, overview };
  }

  /**
   * Gets the player stats and match result for a single match
   * @param teams Array of teams: contains both teams for each match
   */
  getMatchStatistics(teams: Team[][]): MatchStatistics[] {
    return teams.map((team) => {
      const propsToPick = ['name', 'result', 'score', 'teamId'];
      const teamOne: Partial<Team> = pick(team[0], propsToPick);
      const teamTwo: Partial<Team> = pick(team[1], propsToPick);
      const players = team.reduce((acc, curr) => acc.concat(curr.players), <PlayerList>[]);

      return { teamOne, teamTwo, players };
    });
  }

  // Total of each player's performance in the faceoff: goals per game, shots per game, shooting percentage etc
  getOverviewsPerTeam(totalPlayerScores: PlayerList, participants: Participant[]): PlayerOverviewsPerTeam {
    const playerOverviewStats = totalPlayerScores.map((player) => this.getPlayerOverviewRepresentation(player));

    const teamOnePlayers = playerOverviewStats.filter((player) => player.team === 0);
    const teamTwoPlayers = playerOverviewStats.filter((player) => player.team === 1);
    const teamOneName = teamOnePlayers[0].teamName;

    // Parcipant data is used for the banner match information (i.e CGI 5 - Telia 1).
    const participantOne = participants.find(participant => participant.participant[0].name === teamOneName);
    const participantTwo = participants.find(participant => participant.participant[0].name !== teamOneName);

    const mapParticipantData = (participant: Participant): ParticipantInformation => {
      const properties = pick(participant, ['score', 'result']);
      return { ...properties, teamName: participant.participant[0].name };
    };

    const teamOne = { players: teamOnePlayers, participant: mapParticipantData(participantOne) };
    const teamTwo = { players: teamTwoPlayers, participant: mapParticipantData(participantTwo) };

    return { teamOne, teamTwo, players: [ ...teamOnePlayers, ...teamTwoPlayers] } ;
  }

  // Reduces an array of team arrays to a single list including all of the players and their total stats
  getTotalPlayerScoreList(teams:  Team[][]): PlayerList {
    return teams.reduce((acc, curr) => {
      const teamMembers = curr.reduce((x, y) => x.concat(y.players), <PlayerList>[]);
      for (const member of teamMembers) {
        const match = acc.find((player) => player.name === member.name);
        if (match) {
          const updatedPlayerStatistics = this.getUpdatedPlayerStatistics(match, member);
          const index = acc.findIndex((player) => player.name === updatedPlayerStatistics.name);
          acc.splice(index, 1, updatedPlayerStatistics);
        } else {
          member.gamesPlayed = 1;
          acc.push(member);
        }
      }
      return acc;

    }, <PlayerList>[]);
  }

  getUpdatedPlayerStatistics(originalData: Player, newData: Player): Player {
    const dataCopy = cloneDeep(newData);
    const addValues = (originalVal: number, newVal: number) => originalVal + newVal;

    for (const property of this.statProperties) {
      dataCopy[property] = addValues(originalData[property], dataCopy[property]);
    }

    return { ...dataCopy, gamesPlayed: originalData.gamesPlayed + 1};
  }

  getPlayerOverviewRepresentation(player: Player): PlayerOverviewRepresentation {
    const getAverage = (stat: number, gamesPlayed: number) => (stat / gamesPlayed).toFixed(1).toString();
    const formatShootingPercentage = (shootingPercentage: number) => shootingPercentage.toFixed(1).toString() + '%';

    const playerInfo: any = omit(player, this.statProperties);
    const playerOverview: PlayerOverviewRepresentation = { ...playerInfo };

    for (const property of this.statProperties) {
      playerOverview[property] = getAverage(player[property], player.gamesPlayed);
      playerOverview.shootingPercentage = formatShootingPercentage(player.shootingPercentage);
    }

    return playerOverview;
  }

  navigateTo(navigationTarget: string): void {
    const url = navigationTarget === 'matches'
        ? `/tournaments/${this.tournamentId}/stages/${this.stageId}/matches`
        : `/tournaments/${this.tournamentId}/stages/`;

    this.router.navigate([url]);
  }
}
