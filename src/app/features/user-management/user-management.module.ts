import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementIndexComponent } from './pages';
import {
  UserManagementCreateCustomerFormComponent,
  UserManagementCreateSupplierFormComponent,
  UserManagementCreateUserFormComponent,
  UserManagementTableInquiryComponent,
} from './components';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';
import { AgGridModule } from '@node_modules/ag-grid-angular';

@NgModule({
  declarations: [
    UserManagementIndexComponent,
    UserManagementTableInquiryComponent,
    UserManagementCreateUserFormComponent,
    UserManagementCreateCustomerFormComponent,
    UserManagementCreateSupplierFormComponent,
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    SharedComponentsModule,
    ReactiveFormsModule,
    AgGridModule,
  ],
})
export class UserManagementModule {}
