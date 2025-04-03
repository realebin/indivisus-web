import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteProductDetailComponent } from './site-product-detail.component';

describe('SiteProductDetailComponent', () => {
  let component: SiteProductDetailComponent;
  let fixture: ComponentFixture<SiteProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteProductDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SiteProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
