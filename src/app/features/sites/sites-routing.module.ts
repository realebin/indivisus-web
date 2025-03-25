import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SitesIndexComponent } from './pages';
import { SitesDetailComponent } from './components/sites-detail/sites-detail.component';
import { SitesSmallerPackageDetailComponent } from './pages/sites-smaller-package-detail/sites-smaller-package-detail.component';

const routes: Routes = [
  { path: '', component: SitesIndexComponent },
  {
    path: ':id', // Parent route for SitesDetailComponent with site ID
    component: SitesDetailComponent,
  },
  {
    path: ':id/detail/:productId',
    component: SitesSmallerPackageDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SitesRoutingModule {}
