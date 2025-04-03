import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SiteProductDetailComponent } from './pages/site-product-detail/site-product-detail.component';
import { SitesIndexComponent } from './pages';
import { SitesDetailComponent } from './components';

const routes: Routes = [
  { path: '', component: SitesIndexComponent },
  { path: ':id', component: SitesDetailComponent },
  { path: ':id/product/:productId', component: SiteProductDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SitesRoutingModule {}
