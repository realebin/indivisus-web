import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockIndexComponent } from './pages/stock-index/stock-index.component';
import { StockDetailComponent } from './pages/stock-detail/stock-detail.component';
import { StockFormComponent } from './components/stock-form/stock-form.component';

const routes: Routes = [
  {
    path: '',
    component: StockIndexComponent,
  },
  {
    path: 'detail/:id',
    component: StockDetailComponent,
  },
  {
    path: 'add',
    component: StockFormComponent,
  },
  {
    path: 'edit/:id',
    component: StockFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockRoutingModule { }
