import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@features/login/login.component';
import { PublicViewComponent } from '@features/public/public-view/public-view.component';
import { AuthGuard } from '@guards/auth-guard.service';



const routes: Routes = [
  // Redirect the root path to 'dashboard'
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  // Login route (public)
  {
    path: 'login',
    component: LoginComponent,
  },
  // Protected Public routes
  {
    path: '',
    component: PublicViewComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'stock',
        loadChildren: () =>
          import('@features/stock/stock.module').then((m) => m.StockModule),
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('@features/user-management/user-management.module').then(
            (m) => m.UserManagementModule
          ),
      },
      {
        path: 'site',
        loadChildren: () =>
          import('@features/sites/sites.module').then((m) => m.SitesModule),
      },
      {
        path: 'invoice',
        loadChildren: () =>
          import('@features/invoice/invoice.module').then((m) => m.InvoiceModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
