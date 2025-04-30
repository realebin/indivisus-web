import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SiteProductDetailComponent } from './pages/site-product-detail/site-product-detail.component';
import { SitesIndexComponent } from './pages';
import { SitesDetailComponent } from './components';
import { SitesCreateBuilderComponent } from './pages/sites-create-builder/sites-create-builder.component';


const routes: Routes = [
  { path: '', component: SitesIndexComponent },
  { path: 'edit/:id', component: SitesCreateBuilderComponent },  // Use the page component for edit
  { path: 'create', component: SitesCreateBuilderComponent },    // Add route for create
  { path: ':id', component: SitesDetailComponent },
  { path: ':id/product/:productId', component: SiteProductDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SitesRoutingModule { }
