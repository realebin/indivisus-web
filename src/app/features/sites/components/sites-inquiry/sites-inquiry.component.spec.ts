import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesInquiryComponent } from './sites-inquiry.component';

describe('SitesInquiryComponent', () => {
  let component: SitesInquiryComponent;
  let fixture: ComponentFixture<SitesInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SitesInquiryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SitesInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
