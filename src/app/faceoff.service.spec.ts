import { TestBed } from '@angular/core/testing';

import { FaceoffService } from './faceoff.service';

describe('FaceoffService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FaceoffService = TestBed.get(FaceoffService);
    expect(service).toBeTruthy();
  });
});
