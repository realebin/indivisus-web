import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationCardComponent } from './pagination-card.component';

describe('PaginationCardComponent', () => {
  let component: PaginationCardComponent;
  let fixture: ComponentFixture<PaginationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaginationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
