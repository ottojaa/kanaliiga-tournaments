import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';
import { Animations } from 'src/app/utilities/animations';

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.scss'],
  animations: [Animations.enterAnimation(), Animations.listAnimations()],
})
export class TeamsListComponent implements OnInit {
  @Input() teams: Observable<any>;
  displayedColumns: string[] = [
    'index',
    'name',
    'played',
    'wins',
    'losses',
    'scoreFor',
    'scoreAgainst',
    'forfeits',
    'plusMinus',
    'points',
  ];

  tooltips = [
    { column: 'played', tooltip: 'Played' },
    { column: 'wins', tooltip: 'Wins' },
    { column: 'losses', tooltip: 'Losses' },
    { column: 'scoreFor', tooltip: 'Score for' },
    { column: 'scoreAgainst', tooltip: 'Score against' },
    { column: 'forfeits', tooltip: 'Forfeits' },
    { column: 'plusMinus', tooltip: 'Total score' },
  ];
  dataSource: MatTableDataSource<any>;

  constructor() {}

  ngOnInit() {
    this.teams.subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.data = data;
    });
  }

  getTooltip(name: string): string {
    return this.tooltips.find(tooltip => tooltip.column === name).tooltip;
  }
}
