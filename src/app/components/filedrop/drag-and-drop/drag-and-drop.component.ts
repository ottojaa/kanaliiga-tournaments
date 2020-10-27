import { Component, OnInit, Inject } from '@angular/core';
import { Subject, forkJoin, Observable, BehaviorSubject, of } from 'rxjs';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { take, tap, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { Animations } from 'src/app/utilities/animations';
import { Faceoff, Player, Match, Team } from 'src/app/interfaces/faceoff';
import { FaceoffService } from 'src/app/faceoff.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { ToornamentsService } from 'src/app/toornaments.service';
/**
 * Component for rocket league replay parser + drag and drop functionality.
 */
@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss'],
  animations: [Animations.elementAnimations()],
})
export class DragAndDropComponent implements OnInit {
  files: any;
  replays: Buffer[];
  matchId: string;
  stageId: string;
  tournamentId: string;
  uploadProgress: number;
  replayBuffers = [];
  error: string;
  mode = 'determinate';
  participants: any;
  message: string;
  matchNumber: number;
  bufferValue = 0;
  // Array used for ngFor match # column
  games: number[];

  // Emit every time a replay is done being parsed to JSON
  onParse$ = new Subject<Match>();

  // Array containing all the values shown in the UI
  matches: Match[] = [];
  progressSub$ = new BehaviorSubject<number>(0);
  progressObs$: Observable<number>;
  bufferSub$ = new Subject<any>();
  loading = true;

  constructor(
    private faceoffService: FaceoffService,
    public dialogRef: MatDialogRef<any>,
    public snackbar: MatSnackBar,
    public tournamentService: ToornamentsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.progressObs$ = this.progressSub$.asObservable().pipe(
      tap(() => this.bufferSub$.next()),
      debounceTime(200)
    );
  }

  // TODO: refactor this to be clearer.
  ngOnInit(): void {
    this.files = this.data.files;
    this.matchId = this.data.matchId;
    this.participants = this.data.participants;
    this.stageId = this.data.stageId;
    this.tournamentId = this.data.tournamentId;

    this.games = Array.from(Array(this.matchNumber || this.files.length).keys());
    this.replayParser(this.files);

    this.onParse$.subscribe(data => {
      this.matches = [...this.matches, data];
      if (this.matches.length >= this.files.length) {
        this.upload();
      }
    });

    // This will fire when progressSub$ hasn't received a new value in 1500ms to indicate that we are waiting for backend
    this.bufferSub$.pipe(debounceTime(1500)).subscribe(() => {
      this.mode = 'buffer';
      this.bufferValue = this.progressSub$.getValue();
    });
  }

  /**
   * Basically creates a container for all of the data that we want to store in the database.
   * @param matches all of the played matches and their respective data
   */
  createFaceoffEntity(matches: Match[]): Faceoff {
    // Matches have exact time data that we can use to get correct match order
    matches.sort((a, b) => {
      const dateA: any = new Date(a.date);
      const dateB: any = new Date(b.date);
      return dateA - dateB;
    });

    // For future database indexing, it's important that we have also have participant data
    const faceOff = {
      matchId: this.matchId,
      stageId: this.stageId,
      tournamentId: this.tournamentId,
      participants: this.participants,
      date: matches[0].date,
      matches: matches,
    };

    /**
     * Get correct team names code ->
     */

    // First, gather the winning players' names to an array
    const arr = [];
    faceOff.matches.forEach(match => {
      match.teams.forEach(team => {
        if (team.result === 'win') {
          team.players.forEach(player => {
            arr.push(player.name);
          });
        }
      });
    });

    // From toornament stats, get the team whose score is higher.
    const max = Math.max(this.participants[0].score, this.participants[1].score);
    const teamIndex = this.participants.findIndex(participant => participant.score === max);

    /**
     * Accumulate player name duplicates. Breaks when we have found a player whose names appearance is the same as "max".
     * if i.e max === 3, we're searching for the player whose name appears 3 times in the player names array.
     * This player belongs to the winning team, and if we know one player from a team, we know the rest.
     */
    arr.sort();
    let count = 0;
    let curr = '';
    let result = '';
    for (let i = 0; i < arr.length; i++) {
      if (curr === arr[i]) {
        count += 1;
        if (count === max - 1) {
          result = arr[i];
          break;
        }
      } else {
        count = 0;
      }
      curr = arr[i];
    }

    const teamNameAssign = (index: number, participantIndex: number, teams: any) => {
      const teamsCopy = cloneDeep(teams);
      teamsCopy[index].name = this.participants[participantIndex].participant.name;
      teamsCopy[index].teamId = this.participants[participantIndex].participant.id;
      teamsCopy[index].players.forEach(player => {
        player.teamId = this.participants[participantIndex].participant.id;
        player.teamName = this.participants[participantIndex].participant.name;
      });
      return teamsCopy;
    };

    // At this point we know who at least one of the winning team members is "result", so we can assign the
    // that player's team members to the winning team, and the others to the losing team.
    faceOff.matches.forEach(match => {
      match.teams.forEach((team, index) => {
        for (let i = 0; i < team.players.length; i++) {
          if (team.players[i].name === result) {
            match.teams = [...teamNameAssign(index, teamIndex, match.teams)];
            index === 1
              ? (match.teams =
                  teamIndex === 1 ? [...teamNameAssign(0, 0, match.teams)] : [...teamNameAssign(0, 1, match.teams)])
              : (match.teams =
                  teamIndex === 1 ? [...teamNameAssign(1, 0, match.teams)] : [...teamNameAssign(1, 1, match.teams)]);
            break;
          }
        }
      });
    });
    return faceOff;
  }

  /**
   * Reads binary file array as promises.
   * After all promises are resolved, create a new observable array and forkjoin the result JSON (match statistics).
   * @param files binary replay files
   */
  async replayParser(files: any): Promise<void> {
    this.message = 'Uploading match data...';
    const promises = [];

    files.forEach(fileObject => {
      const filePromise = new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
          const event: any = e.target;
          const buffer = Buffer.from(event.result);
          resolve(buffer);
        };
        reader.readAsArrayBuffer(fileObject.file);
      });
      promises.push(filePromise);
    });

    Promise.all(promises).then(buffers => {
      const obj = {
        files: buffers,
        matchName: this.getMatchName(),
      };
      this.faceoffService
        .parseReplays(obj, this.matchId, this.tournamentId)
        .pipe(tap(event => this.getUploadProgress(event)))
        .subscribe(
          (event: any) => {
            if (event instanceof HttpResponse) {
              const res = event.body.data;
              for (let i = 0; i < res.length; i++) {
                this.prettifyReplayJSON(res[i].properties, i);
              }
            }
          },
          err => {
            console.error(err);
            this.error = err.error.message;
          }
        );
    });
  }

  getMatchName(): string {
    return this.participants[0].participant.name + '-' + this.participants[1].participant.name;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  upload(): void {
    this.loading = true;
    const faceoff = this.createFaceoffEntity(this.matches);
    this.faceoffService
      .uploadFaceOff(faceoff)
      .pipe(
        tap(data => this.dialogRef.close(data)),
        catchError(err => {
          this.error = 'Upload failed';
          throw new Error('Error in source. Details: ' + err);
        })
      )
      .subscribe();
  }

  /**
   * Because the RLParser class gives us a pretty unusable format of JSON, we need to prettify it in order to show it on template.
   * Not done in backend because parsing was initially done in browser as it was much faster,
   * but unfortunately VM methods only work in node environment so it had to be moved to BE.
   * @param properties all of the properties that the parser class gives us
   * @param index index of the file
   */
  prettifyReplayJSON(properties: any, index: number): any {
    try {
      // Date when the game was played
      const dateIndex = properties.findIndex(property => property.name === 'Date');
      const date = moment(properties[dateIndex].more.details.value, 'YYYY-MM-DD HH-mm-ss').toISOString();

      // Get team objects
      const teamScores = this.getTeamScores(properties);
      // Get player stats and assign them under the correct teams
      const playerStats = this.getPlayerStats(properties, teamScores, date);

      // Construct a match object that will be shown in the template
      const match = { matchIndex: index, date: date, teams: playerStats };
      this.onParse$.next(match);
    } catch (err) {
      this.loading = false;

      console.error('Error constructing replay JSON, file:', this.files[index], err);
    }
  }

  /**
   * We cherrypick only the useful data from the replay file and reconstruct a new array of teams with only the relevant data,
   * under which the players will subsequently be added.
   */
  getTeamScores(properties: any): Team[] {
    // If the parsed replay header does not have teamXscore, then that team didn't score any goals
    let team_one_score = 0;
    let team_two_score = 0;
    const team_one_score_index = properties.findIndex(file => file.name === 'Team0Score');
    if (team_one_score_index > -1) {
      team_one_score = properties[team_one_score_index].more.details.value;
    }

    const team_two_score_index = properties.findIndex(file => file.name === 'Team1Score');
    if (team_two_score_index > -1) {
      team_two_score = properties[team_two_score_index].more.details.value;
    }
    const team_one_result = team_one_score > team_two_score ? 'win' : 'loss';
    const team_two_result = team_two_score > team_one_score ? 'win' : 'loss';

    const teams = [
      {
        score: team_one_score,
        teamId: 0,
        result: team_one_result,
        name: '',
        stageId: this.stageId,
        tournamentId: this.tournamentId,
        players: [],
      },
      {
        score: team_two_score,
        teamId: 1,
        result: team_two_result,
        name: '',
        stageId: this.stageId,
        tournamentId: this.tournamentId,
        players: [],
      },
    ];
    return teams;
  }

  /**
   * Create a player object with all of the relevant data that we want to show in the UI
   * @param properties Replay file's parsed properties
   * @param teams Toornaments teams
   */
  getPlayerStats(properties: any, teams: Team[], date: string): Team[] {
    const player_stats_index = properties.findIndex(prop => prop.name === 'PlayerStats');
    const player_stats = properties[player_stats_index].more.details.array;

    const arr = [];
    player_stats.forEach((stat: any) => {
      const player: Player | any = {};
      const onlineId = this.getPlayerOnlineId(stat);
      player.platform = this.getPlayerPlatform(stat);
      player.name = this.getPlayerName(stat, onlineId);
      player.team = this.findElementWithName('Team', stat);
      player.score = this.findElementWithName('Score', stat);
      player.goals = this.findElementWithName('Goals', stat);
      player.assists = this.findElementWithName('Assists', stat);
      player.saves = this.findElementWithName('Saves', stat);
      player.shots = this.findElementWithName('Shots', stat);
      player.datePlayed = date;
      player.onlineId = onlineId;
      player.tournamentId = this.tournamentId;
      player.stageId = this.stageId;
      arr.push(player);
    });

    teams = this.getTeamPlayers(0, arr, teams);
    teams = this.getTeamPlayers(1, arr, teams);

    return teams;
  }

  /**
   * Replays always have onlineId, so we can match this id with the ones that we have from toornament to use
   * the toornament name instead of the replay name, which especially in the case of steam can be changed easily.
   */
  getPlayerName(stat: any, onlineId: string): string {
    const lineup = this.tournamentService.participants$.value;
    const player_index = lineup.findIndex(player => onlineId === player.steam_id);
    return player_index > -1 ? lineup[player_index].name : this.findElementWithName('Name', stat);
  }

  getPlayerOnlineId(stat: any): string {
    const idHexadecimals = this.findElementWithNamePartial('OnlineID', stat);
    const { hex1, hex2 } = idHexadecimals;
    return this.hexToDecimalString(hex1 + hex2);
  }

  getPlayerPlatform(stat: any): string {
    return this.findElementWithNamePartial('Platform', stat).value2;
  }

  hexToDecimalString(hex: string): any {
    let i, j, carry;
    const digits = [0];
    for (i = 0; i < hex.length; i += 1) {
      carry = parseInt(hex.charAt(i), 16);
      for (j = 0; j < digits.length; j += 1) {
        digits[j] = digits[j] * 16 + carry;
        // tslint:disable-next-line: no-bitwise
        carry = (digits[j] / 10) | 0;
        digits[j] %= 10;
      }
      while (carry > 0) {
        digits.push(carry % 10);
        // tslint:disable-next-line: no-bitwise
        carry = (carry / 10) | 0;
      }
    }
    return digits.reverse().join('');
  }

  /**
   * Assign the correct teams for players, accumulates player goals and compares to the match result
   * @param teamIndex first or second team index
   * @param arr player array
   * @param teams teams array
   */
  getTeamPlayers(teamIndex: 0 | 1, arr: any[], teams: any): any {
    const team_one = arr.filter(player => player.team === teamIndex);
    const team_one_score = team_one.reduce((x, player) => x + player.goals, 0);
    const team_one_index = teams.findIndex(team => team.score === team_one_score);

    team_one.map(player => {
      player = player;
      player.teamName = teams[team_one_index].name;
    });
    teams[team_one_index].players = team_one;
    return teams;
  }

  findElementWithName(elName: string, player: any): any {
    return player.part.find(el => el.name === elName).more.details.value;
  }

  findElementWithNamePartial(elName: string, player: any): any {
    return player.part.find(el => el.name === elName).more.details;
  }

  private getUploadProgress(event: HttpEvent<any>) {
    if (event.type === HttpEventType.UploadProgress) {
      this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      if (this.uploadProgress !== this.progressSub$.getValue()) {
        if (this.uploadProgress >= 99) {
          this.message = 'Saving replays to database...';
          this.mode = 'buffer';
          this.bufferValue = 0;
          this.progressSub$.next(0);
          return;
        } else if (this.uploadProgress > this.progressSub$.getValue()) {
          this.mode = 'determinate';
          this.progressSub$.next(this.uploadProgress);
        }
      }
    }
  }
}
