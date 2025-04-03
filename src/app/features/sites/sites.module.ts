import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitesRoutingModule } from './sites-routing.module';
import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  SiteCreateFormComponent,
  SiteProductDetailComponent,
  SitesIndexComponent,
} from './pages';
import {
  SitesDetailComponent,
  SitesInquiryComponent,
  SitesStockItemComponent,
} from './components';

@NgModule({
  declarations: [
    SitesIndexComponent,
    SitesDetailComponent,
    SiteCreateFormComponent,
    SiteProductDetailComponent,
    SitesInquiryComponent,
    SitesStockItemComponent,
  ],
  imports: [
    CommonModule,
    SitesRoutingModule,
    SharedComponentsModule,
    ReactiveFormsModule,
    AgGridModule,
  ],
})
export class SitesModule {}
