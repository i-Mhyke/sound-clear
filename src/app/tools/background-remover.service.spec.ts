import { TestBed } from '@angular/core/testing';

import { BackgroundRemoverService } from './background-remover.service';

describe('BackgroundRemoverService', () => {
  let service: BackgroundRemoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundRemoverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
