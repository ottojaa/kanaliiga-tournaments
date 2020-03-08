import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStatsTableComponent } from './player-stats-table.component';
import { MatTableModule, MatSortModule, MatPaginatorModule } from '@angular/material';

@NgModule({
  declarations: [PlayerStatsTableComponent],
  exports: [PlayerStatsTableComponent],
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule],
})
export class PlayerStatsTableModule {}
