import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigPackageCreateComponent } from './big-package-create.component';

describe('BigPackageCreateComponent', () => {
  let component: BigPackageCreateComponent;
  let fixture: ComponentFixture<BigPackageCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BigPackageCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BigPackageCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
