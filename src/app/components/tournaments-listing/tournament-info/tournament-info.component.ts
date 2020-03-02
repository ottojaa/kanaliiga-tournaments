import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Animations } from 'src/app/utilities/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from, Subject, BehaviorSubject, of } from 'rxjs';
import { ToornamentsService } from 'src/app/toornaments.service';
import { groupBy, toArray, mergeMap, flatMap, reduce, takeUntil, filter, take, switchMap } from 'rxjs/operators';
import { FiledropComponent } from '../../filedrop/filedrop.component';
import { FaceoffService } from 'src/app/faceoff.service';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament-info.component.html',
  styleUrls: ['./tournament-info.component.scss'],
  animations: [Animations.listAnimations(), Animations.elementAnimations()],
})
export class TournamentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('fileDropComponent') fileDropComponentList: QueryList<FiledropComponent>;
  matches$: Observable<any>;
  stages$: Observable<any>;
  roundLabels$: Observable<any>;

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
  stageId: string;
  tournamentId: string;
  disableAnimation = true;
  loading = false;

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
    this.getFaceoffs();
    this.getStageData();
    this.getRoundLabels();
    this.currentStage$ = this.getGroups();
  }

  /**
   * Workaround to mat-expansion panels list animations bugging out on pageload
   */
  ngAfterViewInit(): void {
    setTimeout(() => (this.disableAnimation = false), 500);
  }

  getFaceoffs(): any {
    this.faceoffService
      .getFaceoffIds(this.stageId)
      .pipe(take(1))
      .subscribe(faceoffs => {
        this.faceoffs = faceoffs.data;
      });
  }

  checkExistingData(matchId: string): boolean {
    return this.faceoffs.includes(matchId);
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
    this.tournamentService
      .getTournamentRounds(this.tournamentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
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

  /**
   * Returns all the different stages for the current tournament. These are selectable options in the match view dropdown
   */
  getStageData(): void {
    this.stages$ = this.tournamentService.getTournamentStages(this.tournamentId);
  }

  /**
   * Gets the tournament matches, filters by current stage id, then groups them by their round_id.
   * Every different group will be added to the groups array, with which the user can filter the groups by.
   * Emits an array of matches that belong to the user's currently selected group.
   */
  getGroups(): Observable<any> {
    return this.tournamentService.getTournamentMatches(this.tournamentId).pipe(
      take(1),
      flatMap((x: any) => from(x)),
      filter((x: any) => x.stage_id === this.stageId),
      switchMap((group: any[]) => {
        this.setGroupSelectableOptions(group);
        return of(group);
      }),
      filter((x: any) => x.group_id === this.selectedGroup),
      groupBy((match: any) => match.round_id),
      mergeMap((group: any) => group.pipe(reduce((acc, cur) => [...acc, cur], []))),
      toArray()
    );
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
    this.stageId = event.value;
    this.selectedGroup = '';
    this.groups = [];
    this.getFaceoffs();
    this.currentStage$ = this.getGroups();
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
    const index = this.faceoffs.indexOf(event);
    if (index > -1) {
      this.faceoffs.splice(index, 1);
    }
    this.faceoffs = [...this.faceoffs];
  }

  onGroupChange(event: any): void {
    this.selectedGroup = event.value;
    this.currentStage$ = this.getGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
