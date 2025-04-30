import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  constructor(private authService: AuthService) { }

  getNavbarItems() {
    const navItems = [
      { label: 'Dashboard', icon: 'bi-house', href: 'dashboard' },
      { label: 'Stock', icon: 'bi-box2', href: 'stock' },
      { label: 'Site', icon: 'bi-geo-alt', href: 'site' },
      { label: 'Invoice', icon: 'bi-receipt', href: 'invoice' },
    ];

    if (this.authService.getRole() === 'Admin') {
      navItems.splice(2, 0, { label: 'User Management', icon: 'bi-person', href: 'user-management' });
    }

    return navItems;
  }
}