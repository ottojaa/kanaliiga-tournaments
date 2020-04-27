import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceoffOverviewTableComponent } from './faceoff-overview-table.component';

describe('FaceoffOverviewTableComponent', () => {
  let component: FaceoffOverviewTableComponent;
  let fixture: ComponentFixture<FaceoffOverviewTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaceoffOverviewTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceoffOverviewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
