import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesIndexComponent } from './sites-index.component';

describe('SitesIndexComponent', () => {
  let component: SitesIndexComponent;
  let fixture: ComponentFixture<SitesIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SitesIndexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SitesIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
