import { TestBed } from '@angular/core/testing';

import { Purchasing } from './purchasing';

describe('Purchasing', () => {
  let service: Purchasing;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Purchasing);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
