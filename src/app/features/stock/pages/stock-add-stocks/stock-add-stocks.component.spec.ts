import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAddStocksComponent } from './stock-add-stocks.component';

describe('StockAddStocksComponent', () => {
  let component: StockAddStocksComponent;
  let fixture: ComponentFixture<StockAddStocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockAddStocksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockAddStocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
