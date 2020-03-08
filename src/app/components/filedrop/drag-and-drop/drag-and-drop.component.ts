import { Component, OnInit, Inject } from '@angular/core';
import { Subject, forkJoin, Observable, BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { take, tap, debounceTime } from 'rxjs/operators';
import { Animations } from 'src/app/utilities/animations';
import { Faceoff, Player, Match, Team } from 'src/app/interfaces/faceoff';
import { FaceoffService } from 'src/app/faceoff.service';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
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
  uploadProgress = [];
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
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.progressObs$ = this.progressSub$.asObservable().pipe(
      tap(() => this.bufferSub$.next()),
      debounceTime(200)
    );
  }

  // TODO: refactor this to be clearer. Also upload replays along the match data
  ngOnInit(): void {
    this.files = this.data.files;
    this.matchId = this.data.matchId;
    this.participants = this.data.participants;
    this.stageId = this.data.stageId;

    this.games = Array.from(Array(this.matchNumber || this.files.length).keys());
    this.replayParser(this.files);

    this.onParse$.subscribe(data => {
      this.matches = [...this.matches, data];
      if (this.matches.length >= this.files.length) {
        this.upload();
      }
    });

    // This will fire when progressSub$ hasn't received a new value in 1600ms to indicate that we are waiting for backend
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

    // From toornament stats, get the team whose score is higher
    const max = Math.max(this.participants[0].score, this.participants[1].score);
    const teamIndex = this.participants.findIndex(participant => participant.score === max);

    // We now have player's who had at least one win the whole faceoff in an array.
    // Sort the array by name so we can count the duplicates
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
      teamsCopy[index].players.forEach(player => {
        player.teamName = this.participants[participantIndex].participant.name;
      });
      return teamsCopy;
    };

    // At this point we know who at least one of the winning team members is "result", so we can assign the
    // winning team's (participants[teamIndex] name to that player's team, and the other to the loser's team.)
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
      const observables: Observable<any>[] = [];

      const total = buffers.length;
      for (const [index, buffer] of buffers.entries()) {
        this.uploadProgress.push(0);
        observables.push(
          this.faceoffService.parseReplays(buffer).pipe(tap(event => this.getUploadProgress(event, total, index)))
        );
      }

      forkJoin(observables)
        .pipe(take(1))
        .subscribe(
          (replayData: any) => {
            for (let i = 0; i < replayData.length; i++) {
              this.prettifyReplayJSON(replayData[i].body.data.properties, i);
            }
          },
          err => {
            console.error(err);
            this.error = err.error.message;
          }
        );
    });
  }

  readArrayBuffer(file): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = e => {
        const event: any = e.target;
        const buffer = Buffer.from(event.result);
        resolve(buffer);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // Mock upload process for now
  upload(): void {
    this.loading = true;
    const faceoff = this.createFaceoffEntity(this.matches);
    this.faceoffService
      .uploadFaceOff(faceoff)
      .pipe(take(1))
      .subscribe(
        data => {
          this.dialogRef.close(data);
        },
        err => {
          this.error = err.error.message;
        }
      );
  }

  /**
   * Because the RLParser class gives us a pretty unusable format of JSON, we need to prettify it in order to show it on template
   * @param properties all of the properties that the parser class gives us
   * @param index index of the file
   */
  prettifyReplayJSON(properties: any, index: number): any {
    try {
      // Get team objects
      const teamScores = this.getTeamScores(properties);

      // Get player stats and assign them under the correct teams
      const playerStats = this.getPlayerStats(properties, teamScores);

      // Then get date from the properties, which can be used to sort the games
      const dateIndex = properties.findIndex(property => property.name === 'Date');
      const date = moment(properties[dateIndex].more.details.value, 'YYYY-MM-DD HH-mm-ss').toISOString();

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
        name: '',
        result: team_one_result,
        players: [],
      },
      {
        score: team_two_score,
        teamId: 1,
        result: team_two_result,
        name: '',
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
  getPlayerStats(properties: any, teams: Team[]): Team[] {
    const player_stats_index = properties.findIndex(prop => prop.name === 'PlayerStats');
    const player_stats = properties[player_stats_index].more.details.array;

    const arr = [];
    player_stats.forEach((stat: any) => {
      const player: Player | any = {};
      player.team = this.findElementWithName('Team', stat);
      player.name = this.findElementWithName('Name', stat);
      player.score = this.findElementWithName('Score', stat);
      player.goals = this.findElementWithName('Goals', stat);
      player.assists = this.findElementWithName('Assists', stat);
      player.saves = this.findElementWithName('Saves', stat);
      player.shots = this.findElementWithName('Shots', stat);
      arr.push(player);
    });

    teams = this.getTeamPlayers(0, arr, teams);
    teams = this.getTeamPlayers(1, arr, teams);

    return teams;
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

  private getUploadProgress(event: HttpEvent<any>, total: number, index) {
    if (event.type === HttpEventType.UploadProgress) {
      this.uploadProgress[index] = Math.round((100 * event.loaded) / event.total / total);
      const progress = this.uploadProgress.reduce((a, b) => a + b, 0);
      if (progress !== this.progressSub$.getValue()) {
        if (progress === 99) {
          this.message = 'Processing response...';
          this.mode = 'buffer';
          this.bufferValue = 0;
          this.progressSub$.next(0);
          return;
        } else if (progress > this.progressSub$.getValue()) {
          this.mode = 'determinate';
          this.progressSub$.next(progress);
        }
      }
    }
  }
}
