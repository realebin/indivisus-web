import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesStockItemComponent } from './sites-stock-item.component';

describe('SitesStockItemComponent', () => {
  let component: SitesStockItemComponent;
  let fixture: ComponentFixture<SitesStockItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SitesStockItemComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SitesStockItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
