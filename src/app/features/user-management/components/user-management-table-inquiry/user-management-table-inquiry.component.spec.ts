import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementTableInquiryComponent } from './user-management-table-inquiry.component';

describe('UserManagementTableInquiryComponent', () => {
  let component: UserManagementTableInquiryComponent;
  let fixture: ComponentFixture<UserManagementTableInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserManagementTableInquiryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementTableInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
