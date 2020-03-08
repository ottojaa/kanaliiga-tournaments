import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { Animations } from '../../../../utilities/animations';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-player-stats-table',
  templateUrl: './player-stats-table.component.html',
  styleUrls: ['./player-stats-table.component.scss'],
  animations: [Animations.enterAnimation(), Animations.listAnimations()],
})
export class PlayerStatsTableComponent implements OnInit {
  @Input() source: Observable<any>;
  @Input() set type(type: 'total' | 'average') {
    if (this.tableType === type) {
      return;
    }
    this.onTypeChange(type);
  }
  @Input() teamScore;
  data: any;
  tableType: 'average' | 'total' = 'average';
  total = [];
  average = [];
  displayedMatchColumns: string[] = ['name', 'teamName', 'goals', 'assists', 'saves', 'shots', 'games', 'score'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor() {}

  ngOnInit() {
    this.source.subscribe(data => {
      this.total = data.data['total'];
      this.average = data.data['average'];
      this.data = data.data[this.tableType];
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.data = this.data;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.sort.sort({ id: 'score', start: 'desc', disableClear: false });
    });
  }

  onTypeChange(type: 'total' | 'average'): void {
    this.tableType = type;
    this.data = this.tableType === 'total' ? this.total : this.average;
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.data = this.data;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
