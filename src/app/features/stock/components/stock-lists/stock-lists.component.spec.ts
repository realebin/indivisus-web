import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockListsComponent } from './stock-lists.component';

describe('StockListsComponent', () => {
  let component: StockListsComponent;
  let fixture: ComponentFixture<StockListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockListsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
