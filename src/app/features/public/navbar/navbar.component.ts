import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { NavbarService } from 'src/app/data/services/navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {

  navItems: any;
  isSidebarCollapsed = false;
  constructor(private router: Router, private navbarService: NavbarService, private authService: AuthService) {}

  ngOnInit(): void {
    this.navItems = this.navbarService.getNavbarItems();
  }

  logout() {
    this.authService.logout();
  }

  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed; // Update content margin based on sidebar state
  }

}
