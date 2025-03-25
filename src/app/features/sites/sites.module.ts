import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteCreateFormComponent, SitesIndexComponent, SitesSmallerPackageDetailComponent } from './pages';
import { SitesInquiryComponent, SitesDetailComponent, SitesStockItemComponent } from './components';
import { SitesRoutingModule } from './sites-routing.module';
import { SharedComponentsModule } from 'src/app/shared-components/shared-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridModule } from '@node_modules/ag-grid-angular';

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
    SiteCreateFormComponent
  ],
  imports: [
    CommonModule,
    SitesRoutingModule,
    SharedComponentsModule,
    ReactiveFormsModule,
    AgGridModule
  ],
})
export class SitesModule {}
