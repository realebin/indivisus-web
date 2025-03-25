import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesDetailComponent } from './sites-detail.component';

describe('SitesDetailComponent', () => {
  let component: SitesDetailComponent;
  let fixture: ComponentFixture<SitesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SitesDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SitesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
