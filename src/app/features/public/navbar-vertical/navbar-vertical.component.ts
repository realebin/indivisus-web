import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-vertical',
  templateUrl: './navbar-vertical.component.html',
  styleUrl: './navbar-vertical.component.scss',
})
export class NavbarVerticalComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<boolean>();
  @Input() navItems: any;

  isCollapsed = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const windowWidth = window.innerWidth;
    if (windowWidth <= 960) {
      this.isCollapsed = true;
      this.sidebarToggle.emit(this.isCollapsed);
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
  }

  isActive(href: string): boolean {
    return this.router.url === href;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const windowWidth = (event.target as Window).innerWidth;
    const shouldCollapse = windowWidth <= 960;

    if (this.isCollapsed !== shouldCollapse) {
      this.isCollapsed = shouldCollapse;
      this.sidebarToggle.emit(this.isCollapsed);
    }
  }
}
