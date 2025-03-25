import { AuthService } from './data/services/auth.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from '@features/login/login.component';
import { NavbarComponent } from '@features/public/navbar/navbar.component';
import { PublicViewComponent } from './features/public/public-view/public-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CoresModule } from '@cores/cores.module';
import { NavbarVerticalComponent } from './features/public/navbar-vertical/navbar-vertical.component';
import { SharedComponentsModule } from './shared-components/shared-components.module';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpRequestInterceptor } from './http.interceptor';
import { Observable } from 'rxjs';
import { LoadingService } from '@services/loading.service';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([
  AllCommunityModule, // or AllEnterpriseModule
]);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    PublicViewComponent,
    NavbarVerticalComponent,
  ],
  imports: [
    HttpClientModule,
    SharedComponentsModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    CoresModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  isLoading$: Observable<boolean>;

  constructor(
    private loadingService: LoadingService,
    private authService: AuthService
  ) {
    this.isLoading$ = this.loadingService.loading$;
  }
}
