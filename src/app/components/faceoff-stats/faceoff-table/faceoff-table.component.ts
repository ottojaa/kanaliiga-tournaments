import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { Animations } from 'src/app/utilities/animations';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-faceoff-table',
  templateUrl: './faceoff-table.component.html',
  styleUrls: ['./faceoff-table.component.scss'],
  animations: [Animations.enterAnimation(), Animations.listAnimations()],
})
export class FaceoffTableComponent implements OnInit {
  @Input() match;
  @Input() index: number;
  @Input() teamScore;
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
  dataSource = new MatTableDataSource(this.match);
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {}

  ngOnInit() {
    this.dataSource.data = this.match;
    this.dataSource.sort = this.sort;
    this.sort.sort({ id: 'score', start: 'desc', disableClear: false });
  }

  getShotPercentage(shootingPercentage: number): string {
    return shootingPercentage.toFixed(1).toString() + '%';
  }
}
