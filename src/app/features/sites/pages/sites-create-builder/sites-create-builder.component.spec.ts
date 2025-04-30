import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesCreateBuilderComponent } from './sites-create-builder.component';

describe('SitesCreateBuilderComponent', () => {
  let component: SitesCreateBuilderComponent;
  let fixture: ComponentFixture<SitesCreateBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SitesCreateBuilderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SitesCreateBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
