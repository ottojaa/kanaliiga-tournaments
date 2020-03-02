import { TestBed } from '@angular/core/testing';

import { ToornamentsService } from './toornaments.service';

describe('ToornamentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToornamentsService = TestBed.get(ToornamentsService);
    expect(service).toBeTruthy();
  });
});
