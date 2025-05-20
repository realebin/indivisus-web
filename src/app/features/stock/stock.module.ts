import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StockRoutingModule } from './stock-routing.module';
import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';

// Pages
import { StockIndexComponent } from './pages/stock-index/stock-index.component';
import { StockDetailComponent } from './pages/stock-detail/stock-detail.component';


// Components

import { StockListsComponent } from './components/stock-lists/stock-lists.component';
import { BigPackageCreateComponent } from './components/big-package-create/big-package-create.component';
import { SmallPackageCreateComponent } from './components/small-package-create/small-package-create.component';

// AG Grid
import { AgGridModule } from 'ag-grid-angular';
import { StockFormComponent } from './components/stock-form/stock-form.component';
import { StockManagementTableComponent } from './components/stock-management-table/stock-management-table.component';

@NgModule({
  declarations: [
    // Pages
    StockIndexComponent,
    StockDetailComponent,
    StockFormComponent,

    // Components
    StockListsComponent,
    BigPackageCreateComponent,
    SmallPackageCreateComponent,
    StockManagementTableComponent
  ],
  imports: [
    CommonModule,
    StockRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    AgGridModule
  ],
})
export class StockModule { }
