import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiledropComponent } from './filedrop.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FiledropComponent', () => {
  let component: FiledropComponent;
  let fixture: ComponentFixture<FiledropComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FiledropComponent],
      imports: [NoopAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiledropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
