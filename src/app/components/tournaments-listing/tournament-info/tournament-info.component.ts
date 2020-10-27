import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Animations } from 'src/app/utilities/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from, Subject, BehaviorSubject, of, merge, forkJoin, combineLatest } from 'rxjs';
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
  tap,
  finalize,
} from 'rxjs/operators';
import { Location } from '@angular/common';
import { FiledropComponent } from '../../filedrop/filedrop.component';
import { FaceoffService } from 'src/app/faceoff.service';
import { AuthService } from 'src/app/auth.service';
import { Player } from 'src/app/interfaces/faceoff';
import { cloneDeep, get } from 'lodash';
import { MatSnackBar } from '@angular/material';

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
  teams = [];
  selectedStage: any;
  selectedTournament: any;
  selectedGroup = '';
  tableType = 'average';
  stageId: string;
  tournamentId: string;
  disableAnimation = true;
  loading = false;

  teamsLoading = false;
  playersLoading = false;

  initialState = {
    teamStats: [],
    playerStats: [],
    groups: [],
    faceoffIds: [],
    filters: [],
  };

  toggleAll = false;

  filteredTeams$: Observable<any>;
  filters$: Observable<any>;
  teamStats$: Observable<any>;
  tournaments$: Observable<any>;
  stages$: Observable<any>;
  roundLabels$: Observable<any>;
  toggleAll$: Observable<any>;
  playerStats$: Observable<Player[]>;
  loadingSub$ = new Subject();

  public state$: BehaviorSubject<any> = new BehaviorSubject(this.initialState);
  public updateState$: Subject<{ [key: string]: any }> = new Subject();
  public loading$ = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private tournamentService: ToornamentsService,
    private faceoffService: FaceoffService,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.tournamentId = this.activatedRoute.params['_value']['id'];
    this.stageId = this.activatedRoute.params['_value']['stageId'];
  }

  ngOnInit() {
    this.selectedStage = this.stageId;
    this.selectedTournament = this.tournamentId;
    this.getRoundLabels();
    this.initStateObservers();

    this.handleStateUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state$.next(state);
      });

    this.getParticipants()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.tournamentService.participants$.next(data);
      });
  }

  getParticipants(): Observable<any> {
    return this.tournamentService
      .getParticipants(this.tournamentId)
      .pipe(
        map((participants: any) =>
          participants.flatMap(participant => this.createLineupArrayEntity(participant.lineup))
        )
      );
  }

  createLineupArrayEntity(lineup: any): any {
    return lineup.map(player => {
      const steam_id = player.custom_fields.steam_id;
      const pattern = /^[0-9]{17}$/;
      const steam_id_valid = pattern.test(steam_id);
      return {
        name: player.name,
        steam_id: steam_id_valid ? steam_id : null,
      };
    });
  }

  /**
   * Each of these observables' values update whenever their respective state changes.
   */
  initStateObservers(): void {
    this.teamStats$ = this.getStatePart('teamStats');
    this.stages$ = this.getStatePart('stageData');
    this.tournaments$ = this.getStatePart('tournaments');
    this.filters$ = this.getStatePart('filters').pipe(
      tap(filters => (this.toggleAll = filters.every(el => el.checked)))
    );
    this.filteredTeams$ = this.getFilteredTeams();
    this.playerStats$ = this.getStatePart('playerStats').pipe(
      filter((x) => !!x),
      map(x => x[this.tableType]));
    this.toggleAll$ = this.filters$.pipe(map(filters => filters.every(el => (el.checked = true))));
  }

  getFilteredTeams(): Observable<any> {
    const groups$ = this.getStatePart('groups');
    const filters$ = this.getStatePart('filters');
    return combineLatest([groups$, filters$]).pipe(map(data => this.filterByTeams(data)));
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
      this.getTournaments()
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

  getTournaments(): Observable<any> {
    return this.tournamentService.getPlaylistData().pipe(
      catchError(err => {
      console.log(err);
      return of([]);
    }),
    map(tournaments => ({ tournaments })));
  }

  getStatePart(partName: string): Observable<any[]> {
    return this.state$.pipe(map(state => state[partName]));
  }

  getPlayerStats(): Observable<any> {
    this.playersLoading = true;
    return this.faceoffService.getPlayerStats(this.stageId).pipe(
      catchError(err => {
        console.log(err);
        return of([]);
      }),
      tap(() => (this.playersLoading = false)),
      map(players => ({ playerStats: players.data }))
    );
  }

  getTeamStats(): Observable<any> {
    this.teamsLoading = true;
    return this.tournamentService.getTournamentRankings(this.stageId, this.tournamentId).pipe(
      catchError(err => {
        console.log(err);
        return of([]);
      }),
      tap(() => (this.teamsLoading = false)),
      map(this.mapTeamStats)
    );
  }

  mapTeamStats(teams: any): any {
    const teamStats = teams.map((team) => {
      return {
        scoreFor: team.properties.score_for,
        scoreAgainst: team.properties.score_against,
        played: team.properties.played,
        wins: team.properties.wins,
        losses: team.properties.losses,
        forfeits: team.properties.forfeits,
        id: team.participant.id,
        name: team.participant.name
      };
    });
    return { teamStats };
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

  openTeamPage(team: any) {
    const url = `/team/${team.id}`;
    this.router.navigate([url]);
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
      tap(groups => this.setTeamFilters(groups)),
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

  setTeamFilters(groups: any): void {
    const teams = [];
    groups.forEach(group => {
      group.forEach(match => {
        match.opponents.forEach(opponent => {
          if (opponent.participant) {
            const teamIds = teams.map(team => team.id);
            const index = teamIds.findIndex(id => id === opponent.participant.id);
            if (index === -1) {
              const obj = {
                id: opponent.participant.id,
                name: opponent.participant.name,
              };
              teams.push(obj);
            }
          }
        });
      });
    });
    this.teams = teams;

    const filters = teams.map(team => {
      return {
        id: team.id,
        name: team.name,
        checked: true,
      };
    });
    this.updateState$.next({ filters: filters });
  }

  filterByTeams(data: any): any {
    const groups = data[0];
    const filters = data[1];
    if (!groups) {
      return of([]);
    }
    const filterIds = filters.map(el => {
      if (el.checked) {
        return el.id;
      }
    });
    const filteredGroups = [];
    const filteredMatchIds = [];
    groups.forEach(group => {
      group.forEach(match => {
        match.opponents.forEach(opponent => {
          if (opponent.participant && filterIds.includes(opponent.participant.id)) {
            filteredMatchIds.push(match.id);
          }
        });
      });
    });
    groups.forEach(group => {
      filteredGroups.push(group.filter(match => filteredMatchIds.includes(match.id)));
    });
    return filteredGroups;
  }

  onFilterChange(event: any, team: any): void {
    const newFilterState = {
      ...team,
      checked: event.checked,
    };
    this.getStatePart('filters')
      .pipe(
        take(1),
        tap(filters => this.updateFilterState(filters, newFilterState))
      )
      .subscribe();
  }

  updateFilterState(filters: any, filterState: any): void {
    const filtersCopy = cloneDeep(filters);
    const index = filtersCopy.findIndex(copy => copy.id === filterState.id);
    filtersCopy.splice(index, 1, filterState);
    this.updateState$.next({ filters: filtersCopy });
  }

  toggleAllFilters(event: any): void {
    this.getStatePart('filters')
      .pipe(take(1))
      .subscribe(filters => {
        filters = filters.map(el => {
          return {
            ...el,
            checked: event.checked,
          };
        });
        this.updateState$.next({ filters: filters });
      });
  }

  onStageChange(event: any): void {
    // Reset current group choices and get new groups
    this.loadingSub$.next(true);
    this.stageId = event.value;
    this.selectedGroup = '';
    this.groups = [];
    const toUpdate$ = [this.getPlayerStats(), this.getTeamStats(), this.getGroups(), this.getFaceoffIds()];
    forkJoin(toUpdate$).pipe(take(1), finalize(() => this.loadingSub$.next(false))).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        switch (i) {
          case 0:
            this.updateState$.next({ playerStats: get(data, '[0][playerStats]') });
            break;
          case 1:
            this.updateState$.next({ teamStats: get(data, '[1][teamStats]', []) });
            break;
          case 2:
            this.updateState$.next({ groups: get(data, '[2][groups]', []) });
            break;
          case 3:
            this.updateState$.next({ faceoffIds: get(data, '[3][faceoffIds]', []) });
            break;
          default:
            break;
        }
      }
    });
  }

  onTournamentChange(event: any): void {
    this.loading = true;
    this.selectedGroup = '';
    this.groups = [];
    this.loadingSub$.next(true);
    this.tournamentService.getTournamentStages(event.value)
    .pipe(take(1), finalize(() => this.loadingSub$.next(false)))
    .subscribe((data) => {
      if (data && data.length) {
        this.tournamentId = event.value;
        this.stageId = data[0].id;
        const url = `tournaments/${this.tournamentId}/stages/${this.stageId}/matches`;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
          this.router.navigate([url]));
      } else {
        this.snackbar.open('No stages available for requested tournament', 'close', { duration: 3000 });
      }
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
