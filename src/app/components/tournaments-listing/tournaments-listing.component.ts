import { Component, OnInit, Input } from '@angular/core';
import { Tournament } from 'src/app/interfaces/tournament';
import { Observable, forkJoin } from 'rxjs';
import { ToornamentsService } from 'src/app/toornaments.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments-listing.component.html',
  styleUrls: ['./tournaments-listing.component.scss'],
})
export class TournamentsComponent implements OnInit {
  @Input() tournaments$: Observable<Tournament[]>;

  participants = [];

  constructor(public tournamentService: ToornamentsService) {}

  ngOnInit() {
    this.tournaments$.subscribe(data => {
      this.getParticipants(data);
    });
  }

  getParticipants(tournaments: Tournament[]): any {
    const arr = [];
    tournaments.map(tournament => tournament.id).forEach(id => arr.push(this.tournamentService.getParticipants(id)));
    forkJoin(arr)
      .pipe(take(1))
      .subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.participants.push(data[i]);
        }
        console.log(this.participants);
      });
  }
}
