import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Animations } from '../../../../utilities/animations';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-player-stats-table',
  templateUrl: './player-stats-table.component.html',
  styleUrls: ['./player-stats-table.component.scss'],
  animations: [Animations.enterAnimation(), Animations.listAnimations()],
})
export class PlayerStatsTableComponent implements OnInit, OnDestroy {
  @Input() source: Observable<any>;
  @Input() teamScore;
  tableType: 'average' | 'total' = 'average';
  total = [];
  pageIndex = 0;
  average = [];
  displayedMatchColumns: string[] = [
    'index',
    'name',
    'teamName',
    'goals',
    'assists',
    'saves',
    'shots',
    'shootingPercentage',
    'count',
    'score',
  ];
  destroy$ = new Subject();
  dataSource = new MatTableDataSource();

  private paginator: MatPaginator;
  private sort: MatSort;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor() {}

  ngOnInit() {
    this.source.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data) {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex * event.pageSize;
  }

  getShotPercentage(shootingPercentage: number): string {
    return shootingPercentage.toFixed(1).toString() + '%';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
