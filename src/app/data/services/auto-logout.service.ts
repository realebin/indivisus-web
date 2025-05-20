import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subject, timer, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

// const IDLE_TIMEOUT = 10 * 1000; // 10 seconds for testing
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  private idleSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService
  ) {
    this.startIdleDetection();
  }

  private startIdleDetection() {
    this.ngZone.runOutsideAngular(() => {
      const activityEvents = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'click')
      );

      activityEvents.pipe(tap(() => this.resetIdleTimer())).subscribe();

      this.resetIdleTimer(); // Start initial timer
    });
  }

  private resetIdleTimer() {
    if (this.router.url === '/login') {
      return; // Prevent idle detection on login page
    }

    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }

    this.idleSubscription = timer(IDLE_TIMEOUT).subscribe(() => {
      this.logoutUser();
    });

  }

  private logoutUser() {
    this.ngZone.run(() => {
      this.authService.logout();
      localStorage.removeItem('token');
      sessionStorage.clear();

      if (this.router.url !== '/login') {
        alert('You have been logged out due to inactivity.');
        this.router.navigate(['/login']);
      }
    });
  }
}
