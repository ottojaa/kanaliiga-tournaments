import { Component, OnInit } from '@angular/core';
import { ToornamentsService } from 'src/app/toornaments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Animations } from 'src/app/utilities/animations';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-stages',
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.scss'],
  animations: Animations.listAnimations(),
})
export class StagesComponent implements OnInit {
  tournamentId: string;
  stages$: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private tournamentService: ToornamentsService,
    private router: Router
  ) {
    this.tournamentId = this.activatedRoute.params['_value']['id'];
  }

  ngOnInit() {
    this.stages$ = this.tournamentService.getTournamentStages(this.tournamentId);
  }

  navigateTournaments(): void {
    const url = `/tournaments`;
    this.router.navigate([url]);
  }
}
