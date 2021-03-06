import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TournamentsComponent } from './components/tournaments-listing/tournaments-listing.component';
import { TournamentComponent } from './components/tournaments-listing/tournament-info/tournament-info.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { AppComponent } from './app.component';
import { StagesComponent } from './components/tournaments-listing/stages/stages.component';
import { FaceoffStatsComponent } from './components/faceoff-stats/faceoff-stats.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { TeamComponent } from './components/team/team.component';

const routes: Routes = [
  { path: 'tabs', component: TabsComponent },
  { path: 'tournaments', component: TabsComponent, data: { breadcrumb: 'Tournaments' } },
  {
    path: 'tournaments/:id',
    component: TournamentComponent,
    pathMatch: 'full',
  },
  { path: '', component: TabsComponent },
  {
    path: 'tournaments/:id/stages/:stageId/matches',
    component: TournamentComponent,
  },
  { path: 'tournaments/:id/stages/:stageId/faceoff/:faceoffId', component: FaceoffStatsComponent },
  { path: 'tournaments/:id/stages', component: StagesComponent, data: { breadcrumb: 'Stages' } },
  { path: 'home', component: AppComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'team/:id', component: TeamComponent },
  /* { path: '**', component: PageNotFoundComponent } */
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
