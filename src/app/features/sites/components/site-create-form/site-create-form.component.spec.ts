import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteCreateFormComponent } from './site-create-form.component';

describe('SiteCreateFormComponent', () => {
  let component: SiteCreateFormComponent;
  let fixture: ComponentFixture<SiteCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteCreateFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SiteCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
