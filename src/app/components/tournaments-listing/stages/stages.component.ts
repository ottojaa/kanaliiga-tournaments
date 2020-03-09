import { Component, OnInit } from '@angular/core';
import { ToornamentsService } from 'src/app/toornaments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, forkJoin, from } from 'rxjs';
import { Animations } from 'src/app/utilities/animations';
import { delay, map, switchMap, flatMap, toArray, tap, take } from 'rxjs/operators';
import { FaceoffService } from 'src/app/faceoff.service';

@Component({
  selector: 'app-stages',
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.scss'],
  animations: Animations.listAnimations(),
})
export class StagesComponent implements OnInit {
  tournamentId: string;
  stages$: Observable<any>;
  stageFaceoffs$: Observable<any>;
  background = 'warn';
  limit = 5;
  stageLabels: string[];
  constructor(
    private activatedRoute: ActivatedRoute,
    private tournamentService: ToornamentsService,
    private faceoffService: FaceoffService,
    private router: Router
  ) {
    this.tournamentId = this.activatedRoute.params['_value']['id'];
  }

  ngOnInit() {
    this.stages$ = this.tournamentService.getTournamentStages(this.tournamentId);
    this.stageFaceoffs$ = this.groupFaceoffsByStage();
  }

  /**
   * Gets all stage ids, creates a new requests for all of them and returns an array of faceoffs, that all belong to one group
   */
  groupFaceoffsByStage(): Observable<any[]> {
    return this.stages$.pipe(
      tap(faceoffs => (this.stageLabels = faceoffs.map((x: any) => x.name))),
      map(stage => stage.map(x => x.id)),
      switchMap((stageIds: string[]) => {
        return this.groupStages(stageIds);
      }),
      flatMap(x => from(x)),
      map((x: any) => x.data),
      toArray()
    );
  }

  groupStages(stageIds: string[]): Observable<any> {
    const observables = [];
    for (const stage of stageIds) {
      observables.push(this.faceoffService.getFaceoffForStage(stage));
    }
    return forkJoin(observables);
  }

  navigateTournaments(): void {
    const url = `/tournaments`;
    this.router.navigate([url]);
  }
}
