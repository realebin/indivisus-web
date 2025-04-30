import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardInfoComponent } from './components/dashboard-info/dashboard-info.component';

@NgModule({
  declarations: [DashboardInfoComponent],
  imports: [CommonModule, DashboardRoutingModule],
})
export class DashboardModule { }
