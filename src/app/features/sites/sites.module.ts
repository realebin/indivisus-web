import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitesRoutingModule } from './sites-routing.module';
import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  SiteProductDetailComponent,
  SitesIndexComponent,
} from './pages';
import {
  SiteCreateFormComponent,
  SitesDetailComponent,
  SitesInquiryComponent,
  SitesStockItemComponent,
} from './components';
import { SitesCreateBuilderComponent } from './pages/sites-create-builder/sites-create-builder.component';


@NgModule({
  declarations: [
    SitesIndexComponent,
    SitesDetailComponent,
    SiteCreateFormComponent,
    SiteProductDetailComponent,
    SitesInquiryComponent,
    SitesStockItemComponent,
    SitesCreateBuilderComponent,
  ],
  imports: [
    CommonModule,
    SitesRoutingModule,
    SharedComponentsModule,
    ReactiveFormsModule,
    AgGridModule,
  ],
})
export class SitesModule { }
