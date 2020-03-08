import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiledropModule } from '../../filedrop/filedrop.module';
import { PlayerStatsTableModule } from './player-stats-table/player-stats-table.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, FiledropModule, PlayerStatsTableModule],
})
export class TournamentModule {}
