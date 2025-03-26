import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockManagementTableComponent } from './stock-management-table.component';

describe('StockManagementTableComponent', () => {
  let component: StockManagementTableComponent;
  let fixture: ComponentFixture<StockManagementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockManagementTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockManagementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
