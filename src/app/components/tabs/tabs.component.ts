import { Component, OnInit, Input } from '@angular/core';
import { MockData } from 'src/app/utilities/mockdata';
import { Tournament } from 'src/app/interfaces/tournament';
import { ToornamentsService } from 'src/app/toornaments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {

  // TODO: If we want more games to be added, we can add an id parameter to getPlaylistData().
  rocketLeagueTournaments$: Observable<any[]>;

  constructor( private tournamentService: ToornamentsService) {}

  ngOnInit() {
    this.rocketLeagueTournaments$ = this.tournamentService.getPlaylistData();
  }
}
