import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  constructor() {}

  getNavbarItems() {
    return [
      { label: 'Dashboard', icon: 'bi-house', href: 'dashboard' },
      { label: 'Stock', icon: 'bi-box2', href: 'stock' },
      { label: 'User Management', icon: 'bi-person', href: 'user-management' },
      { label: 'Site', icon: 'bi-geo-alt', href: 'site' },
      // { label: 'Invoice', icon: 'bi-filter-square', href: 'invoice' },
      // { label: 'Settings', icon: 'bi-gear', href: 'settings' },
      // { label: 'Help', icon: 'bi-question-circle', href: 'help' },
    ];
  }
}
