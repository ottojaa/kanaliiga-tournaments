import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Animations } from 'src/app/utilities/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from, Subject, BehaviorSubject, of, combineLatest, merge, forkJoin, interval } from 'rxjs';
import { ToornamentsService } from 'src/app/toornaments.service';
import {
  groupBy,
  toArray,
  mergeMap,
  flatMap,
  reduce,
  takeUntil,
  filter,
  take,
  switchMap,
  map,
  catchError,
  delay,
  debounceTime,
  tap,
} from 'rxjs/operators';
import { FiledropComponent } from '../../filedrop/filedrop.component';
import { FaceoffService } from 'src/app/faceoff.service';
import { AuthService } from 'src/app/auth.service';
import { Player } from 'src/app/interfaces/faceoff';
import { flatten } from '@angular/compiler';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament-info.component.html',
  styleUrls: ['./tournament-info.component.scss'],
  animations: [Animations.listAnimations(), Animations.elementAnimations()],
})
export class TournamentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('fileDropComponent') fileDropComponentList: QueryList<FiledropComponent>;

  destroy$ = new Subject();

  // Used to filter different groups
  allMatches$ = new BehaviorSubject([]);

  // Has the data of selected group
  currentStage$: Observable<any>;

  groups = [];
  labels = [];
  faceoffs = [];
  selectedStage: any;
  selectedGroup = '';
  tableType = 'average';
  stageId: string;
  tournamentId: string;
  disableAnimation = true;
  loading = false;

  initialState = {
    teamStats: [],
    playerStats: [],
    groups: [],
    faceoffIds: [],
  };

  teamStats$: Observable<any>;
  stages$: Observable<any>;
  roundLabels$: Observable<any>;
  playerStats$: Observable<Player[]>;

  public state$: BehaviorSubject<any> = new BehaviorSubject(this.initialState);
  public updateState$: Subject<{ [key: string]: any }> = new Subject();
  public loading$ = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private tournamentService: ToornamentsService,
    private faceoffService: FaceoffService,
    private authService: AuthService,
    private router: Router
  ) {
    this.tournamentId = this.activatedRoute.params['_value']['id'];
    this.stageId = this.activatedRoute.params['_value']['stageId'];
  }

  ngOnInit() {
    this.loading = true;
    this.selectedStage = this.stageId;
    this.getRoundLabels();
    this.teamStats$ = this.getStatePart('teamStats');
    this.stages$ = this.getStatePart('stageData');
    this.playerStats$ = this.getStatePart('playerStats').pipe(map(x => x[this.tableType]));
    this.currentStage$ = this.getStatePart('groups');

    this.handleStateUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loading = false;
        this.state$.next(state);
      });
  }

  /**
   * Workaround to mat-expansion panels list animations bugging out on pageload
   */
  ngAfterViewInit(): void {
    setTimeout(() => (this.disableAnimation = false), 500);
  }

  handleStateUpdate(): Observable<any> {
    const observables = [
      this.updateState$,
      this.getTeamStats(),
      this.getPlayerStats(),
      this.getFaceoffIds(),
      this.getGroups(),
      this.getStageData(),
      this.getFaceoffs(),
    ];

    return merge(...observables).pipe(flatMap(this.getNewState()));
  }

  getNewState(): (obj: { [key: string]: any }) => Observable<any> {
    return obj =>
      this.state$.pipe(
        take(1),
        map((state): any => ({ ...state, ...obj }))
      );
  }

  getCurrentTableType(): Observable<any> {
    return this.getStatePart('playerStats').pipe(map(x => x[this.tableType]));
  }

  getStatePart(partName: string): Observable<any[]> {
    return this.state$.pipe(map(state => state[partName]));
  }

  getPlayerStats(): Observable<any> {
    return this.faceoffService.getPlayerStats(this.stageId).pipe(
      catchError(err => {
        console.log(err);
        return of([]);
      }),
      map(players => ({ playerStats: players.data }))
    );
  }

  getTeamStats(): Observable<any> {
    return this.faceoffService.getTeamStatsForStage(this.stageId).pipe(
      catchError(err => {
        console.log(err);
        return of([]);
      }),
      map(teams => ({ teamStats: teams.data }))
    );
  }

  getFaceoffIds(): Observable<any> {
    return this.faceoffService.getFaceoffIds(this.stageId).pipe(
      catchError(err => {
        console.log(err);
        return of([]);
      }),
      map(faceoffs => ({ faceoffIds: faceoffs.data }))
    );
  }

  getFaceoffs(): Observable<any> {
    return this.faceoffService.getFaceoffIds(this.stageId).pipe(
      catchError(err => {
        console.log(err);
        return of([]);
      }),
      map(faceoffs => ({ faceoffIds: faceoffs.data }))
    );
  }

  checkExistingData(matchId: string): boolean {
    return this.state$.value['faceoffIds'].includes(matchId);
  }

  getCurrentUser(): any {
    return this.authService.currentUserData$.getValue();
  }

  navigateToStages(): void {
    const url = `/tournaments/${this.tournamentId}/stages`;
    this.router.navigate([url]);
  }

  /**
   * Get a list of round objects, used to match round labels with correct groups
   */
  getRoundLabels(): void {
    this.tournamentService.getTournamentRounds(this.tournamentId).subscribe(data => {
      this.labels = data;
    });
  }

  /**
   * Get a specific round label (shown in template)
   * @param group current group whose groupId we can use to match correct round label
   */
  getRoundLabel(roundId: any): string {
    try {
      const name = this.labels.find(label => label.id === roundId);
      return name ? name['name'] : 'Unable to match round label';
    } catch (err) {
      console.error('Error matching labels: ', err);
      return 'Unable to match round label';
    }
  }

  changeTableType(type: string): void {
    this.tableType = type;
    this.updateState$.next();
  }

  /**
   * Returns all the different stages for the current tournament. These are selectable options in the match view dropdown
   */
  /*   getStageData(): void {
    this.stages$ = this.tournamentService.getTournamentStages(this.tournamentId);
  } */

  getStageData(): Observable<any> {
    return this.tournamentService.getTournamentStages(this.tournamentId).pipe(
      catchError(err => {
        console.log(err);
        return of([]);
      }),
      map(stage => ({ stageData: stage }))
    );
  }

  /**
   * Gets the tournament matches, filters by current stage id, then groups them by their round_id.
   * Every different group will be added to the groups array, with which the user can filter the groups by.
   * Emits an array of matches that belong to the user's currently selected group.
   */
  getGroups(): Observable<any> {
    return this.tournamentService.getTournamentMatches(this.tournamentId).pipe(
      flatMap((x: any) => from(x)),
      filter((x: any) => x.stage_id === this.stageId),
      switchMap((group: any[]) => {
        this.setGroupSelectableOptions(group);
        return of(group);
      }),
      filter((x: any) => x.group_id === this.selectedGroup),
      groupBy((match: any) => match.round_id),
      mergeMap((group: any) => group.pipe(reduce((acc, cur) => [...acc, cur], []))),
      toArray(),
      map(groups => ({ groups: groups }))
    );
  }

  getFilteredGroups(groups$: Observable<any>): Observable<any> {
    return groups$.pipe(flatMap(groups => groups.filter(group => group)));
  }

  setGroupSelectableOptions(match): void {
    const index = this.groups.findIndex(group => group === match.group_id);

    // Accumulates different groups into the groups array
    if (index === -1) {
      this.groups.push(match.group_id);
    }
    // Set the default group
    if (!this.selectedGroup) {
      this.selectedGroup = this.groups[0];
    }
  }

  onStageChange(event: any): void {
    // Reset current group choices and get new groups
    this.loading = !this.loading;
    this.stageId = event.value;
    this.selectedGroup = '';
    this.groups = [];
    const toUpdate$ = [this.getPlayerStats(), this.getTeamStats(), this.getGroups(), this.getFaceoffIds()];
    forkJoin(toUpdate$).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        switch (i) {
          case 0:
            this.updateState$.next({ playerStats: data[0]['playerStats'] });
            break;
          case 1:
            this.updateState$.next({ teamStats: data[1]['teamStats'] });
            break;
          case 2:
            this.updateState$.next({ groups: data[2]['groups'] });
            break;
          case 3:
            this.updateState$.next({ faceoffIds: data[3]['faceoffIds'] });
            break;
          default:
            break;
        }
      }
      this.loading = false;
    });
  }

  /**
   * Toggle expansion panels programmatically, as otherwise they require expansion panel header to be clicked.
   * (clicking an icon is fancier)
   */
  onToggleExpand(matchId: string): void {
    const components = this.fileDropComponentList.toArray();
    const index = components.findIndex(component => component.matchId === matchId);
    if (index > -1) {
      components[index].expanded = !components[index].expanded;
    } else {
      const err = 'MatchId not found from queryList, matchId: ' + matchId;
      throw new Error(err);
    }
  }

  onDeleteFaceoff(event: string): void {
    this.getStatePart('faceoffIds')
      .pipe(take(1))
      .subscribe(data => {
        const index = data.indexOf(event);
        if (index > -1) {
          data.splice(index, 1);
        }
        this.updateState$.next({ faceoffIds: data });
      });
  }

  onGroupChange(event: any): void {
    this.selectedGroup = event.value;
    this.updateState$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
