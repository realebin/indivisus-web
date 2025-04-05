import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { NavbarService } from 'src/app/data/services/navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Output() toggleMobileSidebar = new EventEmitter<void>();

  navItems: any;
  isSidebarCollapsed = false;
  name = localStorage.getItem('name');

  constructor(
    private router: Router,
    private navbarService: NavbarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.navItems = this.navbarService.getNavbarItems();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileSidebarMenu(): void {
    this.toggleMobileSidebar.emit();
  }
}
