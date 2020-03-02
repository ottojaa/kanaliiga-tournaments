import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceoffStatsComponent } from './faceoff-stats.component';

describe('FaceoffStatsComponent', () => {
  let component: FaceoffStatsComponent;
  let fixture: ComponentFixture<FaceoffStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaceoffStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceoffStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
