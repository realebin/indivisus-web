import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceCreateComponent, InvoiceDetailComponent, InvoiceIndexComponent } from './pages';


const routes: Routes = [
  {
    path: '',
    component: InvoiceIndexComponent,
  },
  {
    path: 'detail/:id',
    component: InvoiceDetailComponent,
  },
  {
    path: 'create',
    component: InvoiceCreateComponent,
  },
  {
    path: 'edit/:id',
    component: InvoiceCreateComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule { }
