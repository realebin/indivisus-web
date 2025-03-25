import { TestBed } from '@angular/core/testing';

import { StockHttpServices } from './stock.http-services';

describe('StockHttpServices', () => {
  let service: StockHttpServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockHttpServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
