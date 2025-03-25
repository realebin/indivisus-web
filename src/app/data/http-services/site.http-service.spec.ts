import { TestBed } from '@angular/core/testing';

import { SiteHttpService } from './site.http-service';

describe('SitesHttpServiceService', () => {
  let service: SiteHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
