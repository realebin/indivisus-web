import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementIndexComponent } from './user-management-index.component';

describe('UserManagementIndexComponent', () => {
  let component: UserManagementIndexComponent;
  let fixture: ComponentFixture<UserManagementIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserManagementIndexComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
