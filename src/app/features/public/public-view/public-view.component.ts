import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { NavbarService } from 'src/app/data/services/navbar.service';

@Component({
  selector: 'app-public-view',
  templateUrl: './public-view.component.html',
  styleUrls: ['./public-view.component.scss'],
})
export class PublicViewComponent {
  isSidebarCollapsed = false;
  isMobileSidebarVisible = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private navbarService: NavbarService
  ) {
    if (!localStorage.getItem('authToken')) {
      this.router.navigate(['/login']);
    }

    // Check screen size on init
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    // Automatically collapse sidebar on mobile
    if (window.innerWidth < 768) {
      this.isSidebarCollapsed = true;
      this.isMobileSidebarVisible = false;
    }
  }

  onSidebarToggle(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarVisible = !this.isMobileSidebarVisible;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarVisible = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
