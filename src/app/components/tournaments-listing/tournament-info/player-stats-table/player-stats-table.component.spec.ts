import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStatsTableComponent } from './player-stats-table.component';

describe('PlayerStatsTableComponent', () => {
  let component: PlayerStatsTableComponent;
  let fixture: ComponentFixture<PlayerStatsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerStatsTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerStatsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
