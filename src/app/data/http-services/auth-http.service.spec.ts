import { TestBed } from '@angular/core/testing';

import { AuthHttpService } from './auth-http.service';

describe('AuthHttpServicesService', () => {
  let service: AuthHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
