import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { Animations } from 'src/app/utilities/animations';
import { MatTableDataSource, MatSort } from '@angular/material';
import { MatchStatistics } from 'src/app/interfaces/faceoff';

@Component({
  selector: 'app-faceoff-table',
  templateUrl: './faceoff-table.component.html',
  styleUrls: ['./faceoff-table.component.scss'],
  animations: [Animations.enterAnimation(), Animations.listAnimations()],
})
export class FaceoffTableComponent implements OnInit {
  @Input() match: MatchStatistics;
  @Input() index: number;

  displayedMatchColumns: string[] = [
    'index',
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
    this.dataSource.data = this.match.players;
  }

  getShotPercentage(shootingPercentage: number): string {
    return shootingPercentage.toFixed(1).toString() + '%';
  }
}
