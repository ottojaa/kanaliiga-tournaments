import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { TeamOverview, PlayerOverviewsPerTeam } from 'src/app/interfaces/faceoff';

@Component({
  selector: 'app-faceoff-overview-table',
  templateUrl: './faceoff-overview-table.component.html',
  styleUrls: ['./faceoff-overview-table.component.scss'],
})
export class FaceoffOverviewTableComponent implements OnInit {
  @Input() match: PlayerOverviewsPerTeam;
  @Input() index: number;
  @Input() date: string;

  displayedMatchColumns: string[] = [
    'name',
    'teamName',
    'goals',
    'assists',
    'saves',
    'shots',
    'shootingPercentage',
    'score',
  ];
  dataSource = new MatTableDataSource();
  private sort: MatSort;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.dataSource.sort = this.sort;
    this.sort.sort({ id: 'score', start: 'desc', disableClear: false });
  }

  constructor() {}

  ngOnInit() {
    this.dataSource.data = this.index === 0 ? this.match.teamOne.players : this.match.teamTwo.players;
  }
}
