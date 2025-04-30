import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesSmallerPackageDetailComponent } from './sites-smaller-package-detail.component';

describe('SitesSmallerPackageDetailComponent', () => {
  let component: SitesSmallerPackageDetailComponent;
  let fixture: ComponentFixture<SitesSmallerPackageDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SitesSmallerPackageDetailComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SitesSmallerPackageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
