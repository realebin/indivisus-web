import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockIndexComponent } from './pages/stock-index/stock-index.component';
import { StockAddStocksComponent } from './pages';

const routes: Routes = [
  {
    path: '',
    component: StockIndexComponent,
  },
  {
    path: 'add-stocks',
    component: StockAddStocksComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockRoutingModule {}
