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
  displayedMatchColumns: string[] = ['name', 'teamName', 'goals', 'assists', 'saves', 'shots', 'score'];
  dataSource = new MatTableDataSource(this.match);
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {}

  ngOnInit() {
    this.dataSource.data = this.match;
    this.dataSource.sort = this.sort;
    this.sort.sort({ id: 'score', start: 'desc', disableClear: false });
  }

  getShotPercentage(goals: number, shots: number): string {
    const number = (goals / shots + Number.EPSILON) * 100;
    if (isNaN(number) || number <= 0) {
      return '0.0%';
    } else if (number === 100) {
      return '100%';
    }
    return ((goals / shots + Number.EPSILON) * 100).toFixed(1).toString() + '%';
  }
}
