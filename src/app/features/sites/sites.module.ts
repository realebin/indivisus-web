import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitesIndexComponent, SitesSmallerPackageDetailComponent } from './pages';
import { SitesInquiryComponent } from './components';
import { SitesRoutingModule } from './sites-routing.module';
import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';
import { SitesDetailComponent } from './components/sites-detail/sites-detail.component';
import { SitesStockItemComponent } from './components/sites-stock-item/sites-stock-item.component';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridAngular, AgGridModule } from '@node_modules/ag-grid-angular';

ModuleRegistry.registerModules([
  AllCommunityModule, // or AllEnterpriseModule
]);


@NgModule({
  declarations: [
    SitesIndexComponent,
    SitesInquiryComponent,
    SitesDetailComponent,
    SitesStockItemComponent,
    SitesSmallerPackageDetailComponent,
  ],
  imports: [
    CommonModule,
    SitesRoutingModule,
    SharedComponentsModule,
    AgGridModule
  ],
})
export class SitesModule{

}
