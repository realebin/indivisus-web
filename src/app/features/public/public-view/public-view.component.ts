import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-public-view',
  templateUrl: './public-view.component.html',
  styleUrl: './public-view.component.scss',
})
export class PublicViewComponent {
  constructor(private router: Router, private authService: AuthService) {
    if (!localStorage.getItem('loggedUser')) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    // localStorage.removeItem('loggedUser');
    // this.router.navigate(['/login']);
  }
}
