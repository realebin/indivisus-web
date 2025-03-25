import { TestBed } from '@angular/core/testing';

import { UserManagementHttpService } from './user-management-http.service';

describe('UserManagementHttpService', () => {
  let service: UserManagementHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserManagementHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
