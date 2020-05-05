import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TournamentsComponent } from './components/tournaments-listing/tournaments-listing.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import {
  MatInputModule,
  MatSortModule,
  MatFormFieldModule,
  MatRadioModule,
  MatPaginatorModule,
  MatButtonToggleModule,
} from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { TabsComponent } from './components/tabs/tabs.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { TournamentComponent } from './components/tournaments-listing/tournament-info/tournament-info.component';
import { RouterModule } from '@angular/router';
import { RouterComponent } from './components/router/router.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToornamentsService } from './toornaments.service';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptorService } from './api-interceptor.service';
import { StagesComponent } from './components/tournaments-listing/stages/stages.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FiledropComponent } from './components/filedrop/filedrop.component';
import { DragAndDropComponent } from './components/filedrop/drag-and-drop/drag-and-drop.component';
import { FaceoffStatsComponent } from './components/faceoff-stats/faceoff-stats.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './register-login/login/login.component';
import { RegisterComponent } from './register-login/register/register.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ConfirmDialogComponent } from './common/confirm-dialog/confirm-dialog.component';
import { FaceoffTableComponent } from './components/faceoff-stats/faceoff-table/faceoff-table.component';
import { PlayerStatsTableModule } from './components/tournaments-listing/tournament-info/player-stats-table/player-stats-table.module';
import { TeamsListComponent } from './components/teams-list/teams-list.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FaceoffOverviewTableComponent } from './components/faceoff-stats/faceoff-overview-table/faceoff-overview-table.component';
import { TeamComponent } from './components/team/team.component';
import { StatsGridListComponent } from './components/team/stats-grid-list/stats-grid-list.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SidebarComponent,
    TournamentsComponent,
    TournamentComponent,
    FiledropComponent,
    StagesComponent,
    TabsComponent,
    FaceoffTableComponent,
    SidebarComponent,
    RouterComponent,
    DragAndDropComponent,
    FaceoffStatsComponent,
    LoginComponent,
    RegisterComponent,
    ConfirmDialogComponent,
    TeamsListComponent,
    AdminPanelComponent,
    FaceoffOverviewTableComponent,
    TeamComponent,
    StatsGridListComponent,
  ],
  imports: [
    BrowserModule,
    MatMenuModule,
    AppRoutingModule,
    MatPaginatorModule,
    RouterModule,
    MatStepperModule,
    MatSlideToggleModule,
    BrowserAnimationsModule,
    MatSortModule,
    PlayerStatsTableModule,
    HttpClientModule,
    MatDialogModule,
    NgxSkeletonLoaderModule,
    DragDropModule,
    MatTableModule,
    MatToolbarModule,
    MatSnackBarModule,
    FlexLayoutModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatGridListModule,
    MatInputModule,
    MatRadioModule,
    MatGridListModule,
    MatListModule,
    MatCardModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressBarModule,
    NgxFileDropModule,
    FormsModule,
    MatInputModule,
    MatSidenavModule,
  ],
  providers: [
    ToornamentsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptorService,
      multi: true,
    },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  entryComponents: [DragAndDropComponent, RegisterComponent, LoginComponent, ConfirmDialogComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(@Inject(OverlayContainer) private overlayContainer: OverlayContainer) {
    this.overlayContainer.getContainerElement().classList.add('mytheme-alt-theme'); // this for double theme add to the root css class
  }
}
