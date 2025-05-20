import { Component } from '@angular/core';
import { Observable } from '@node_modules/rxjs/dist/types';
import { AutoLogoutService } from '@services/auto-logout.service';
import { LoadingService } from '@services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isLoading$: Observable<boolean>;

  constructor(
    private loadingService: LoadingService,
    private autoLogoutService: AutoLogoutService
  ) {
    this.isLoading$ = this.loadingService.loading$;
  }
}
