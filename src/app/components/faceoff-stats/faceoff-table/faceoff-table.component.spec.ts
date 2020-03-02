import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceoffTableComponent } from './faceoff-table.component';

describe('FaceoffTableComponent', () => {
  let component: FaceoffTableComponent;
  let fixture: ComponentFixture<FaceoffTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaceoffTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceoffTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
