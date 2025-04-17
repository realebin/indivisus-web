import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';

// Pages


// AG Grid
import { AgGridModule } from 'ag-grid-angular';
import { InvoiceCreateComponent, InvoiceDetailComponent, InvoiceIndexComponent } from './pages';
import { InvoiceFilterComponent, InvoiceFormComponent, InvoiceLineItemComponent, InvoiceListComponent } from './components';
import { InvoiceEditComponent } from './components/invoice-edit/invoice-edit.component';


@NgModule({
  declarations: [
    // Pages
    InvoiceIndexComponent,
    InvoiceDetailComponent,
    InvoiceCreateComponent,

    // Components
    InvoiceListComponent,
    InvoiceFormComponent,
    InvoiceLineItemComponent,
    InvoiceFilterComponent,
    InvoiceEditComponent,
  ],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    AgGridModule
  ],
})
export class InvoiceModule {}
