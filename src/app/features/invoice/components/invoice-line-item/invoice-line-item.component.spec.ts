import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceLineItemComponent } from './invoice-line-item.component';

describe('InvoiceLineItemComponent', () => {
  let component: InvoiceLineItemComponent;
  let fixture: ComponentFixture<InvoiceLineItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceLineItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvoiceLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
