import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SitesIndexComponent } from './pages/sites-index/sites-index.component';
import { SitesDetailComponent } from './components/sites-detail/sites-detail.component';
import { SiteProductDetailComponent } from './pages/site-product-detail/site-product-detail.component';

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
