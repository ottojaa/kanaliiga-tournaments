import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-faceoff-overview-table',
  templateUrl: './faceoff-overview-table.component.html',
  styleUrls: ['./faceoff-overview-table.component.scss'],
})
export class FaceoffOverviewTableComponent implements OnInit {
  @Input() match;
  @Input() index: number;
  @Input() participant;
  @Input() participantTwo;
  @Input() date;
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
  dataSource = new MatTableDataSource(this.match);
  private sort: MatSort;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.dataSource.sort = this.sort;
    this.sort.sort({ id: 'score', start: 'desc', disableClear: false });
  }

  constructor() {}

  ngOnInit() {
    this.dataSource.data = this.match;
  }
}
