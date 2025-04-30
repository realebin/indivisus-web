import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementCreateUserFormComponent } from './user-management-create-user-form.component';

describe('UserManagementCreateUserFormComponent', () => {
  let component: UserManagementCreateUserFormComponent;
  let fixture: ComponentFixture<UserManagementCreateUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserManagementCreateUserFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserManagementCreateUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
