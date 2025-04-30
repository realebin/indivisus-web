import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardInfoComponent } from './components/dashboard-info/dashboard-info.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardInfoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
