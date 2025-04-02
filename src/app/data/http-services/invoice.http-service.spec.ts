import { TestBed } from '@angular/core/testing';

import { InvoiceHttpService } from './invoice.http-service';

describe('InvoiceHttpService', () => {
  let service: InvoiceHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
