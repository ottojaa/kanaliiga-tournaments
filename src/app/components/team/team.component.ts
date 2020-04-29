import { Component, OnInit } from '@angular/core';
import { TeamsService } from 'src/app/teams.service';
import { ActivatedRoute } from '@angular/router';
import { ToornamentsService } from 'src/app/toornaments.service';
import { switchMap, flatMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  teamId: string;
  constructor(
    private teamService: TeamsService,
    private activatedRoute: ActivatedRoute,
    private toornamentService: ToornamentsService
  ) {
    this.teamId = this.activatedRoute.params['_value']['id'];
  }

  ngOnInit(): void {
    this.getTeamInformation();
  }

  getTeamInformation(): void {
    this.teamService
      .getTeamById(this.teamId)
      .pipe(flatMap(matches => of(matches.data)))
      .subscribe(data => {
        console.log(data);
      });
  }
}
