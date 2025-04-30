import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallPackageCreateComponent } from './small-package-create.component';

describe('SmallPackageCreateComponent', () => {
  let component: SmallPackageCreateComponent;
  let fixture: ComponentFixture<SmallPackageCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmallPackageCreateComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SmallPackageCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
