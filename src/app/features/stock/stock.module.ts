import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockRoutingModule } from './stock-routing.module';
import { StockIndexComponent } from './pages/stock-index/stock-index.component';
import { StockFilterComponent } from './components/stock-filter/stock-filter.component';
import { StockListsComponent } from './components/stock-lists/stock-lists.component';
import { FormsModule } from '@node_modules/@angular/forms';
import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';
import { StockAddStocksComponent } from './pages/stock-add-stocks/stock-add-stocks.component';

@NgModule({
  declarations: [
    StockIndexComponent,
    StockFilterComponent,
    StockListsComponent,
    StockAddStocksComponent,
  ],
  imports: [
    CommonModule,
    StockRoutingModule,
    FormsModule,
    SharedComponentsModule,
  ],
})
export class StockModule {}
