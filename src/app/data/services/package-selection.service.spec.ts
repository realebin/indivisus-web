import { TestBed } from '@angular/core/testing';

import { PackageSelectionService } from './package-selection.service';

describe('PackageSelectionService', () => {
  let service: PackageSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PackageSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
