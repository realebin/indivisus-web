import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveDataTableComponent } from './responsive-data-table.component';

describe('ResponsiveDataTableComponent', () => {
  let component: ResponsiveDataTableComponent;
  let fixture: ComponentFixture<ResponsiveDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResponsiveDataTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResponsiveDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
