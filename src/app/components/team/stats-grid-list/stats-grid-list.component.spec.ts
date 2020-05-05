import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsGridListComponent } from './stats-grid-list.component';

describe('StatsGridListComponent', () => {
  let component: StatsGridListComponent;
  let fixture: ComponentFixture<StatsGridListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatsGridListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsGridListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
