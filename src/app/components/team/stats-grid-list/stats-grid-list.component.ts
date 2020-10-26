import { Component, OnInit, Input } from '@angular/core';
import { isEmpty } from 'lodash';

@Component({
  selector: 'app-stats-grid-list',
  templateUrl: './stats-grid-list.component.html',
  styleUrls: ['./stats-grid-list.component.scss'],
})
export class StatsGridListComponent implements OnInit {
  @Input() stats: any;
  value = 'average';
  displayStats: any;
  showContent = false;
  constructor() {}

  ngOnInit(): void {
    if (!isEmpty(this.stats)) {
      this.displayStats = { ...this.stats[this.value][0] };
    }
    this.showContent = !isEmpty(this.displayStats);
  }

  onValueChange(event: any): void {
    this.value = event.value;
    this.displayStats = { ...this.stats[this.value][0] };
    this.showContent = !isEmpty(this.displayStats);
  }

  getDisplayValue(value: number, decimals: number): string {
    if (this.value === 'total') {
      decimals = 0;
    }
    return value.toFixed(decimals).toString();
  }
}
