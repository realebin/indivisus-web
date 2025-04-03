import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteIndexComponent } from './pages/site-index/site-index.component';
import { SiteDetailComponent } from './pages/site-detail/site-detail.component';
import { SiteProductDetailComponent } from './pages/site-product-detail/site-product-detail.component';

const routes: Routes = [
  { path: '', component: SiteIndexComponent },
  { path: ':id', component: SiteDetailComponent },
  { path: ':id/product/:productId', component: SiteProductDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SitesRoutingModule {}
