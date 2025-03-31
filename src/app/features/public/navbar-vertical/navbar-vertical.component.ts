import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavbarService } from 'src/app/data/services/navbar.service';

@Component({
  selector: 'app-navbar-vertical',
  templateUrl: './navbar-vertical.component.html',
  styleUrls: ['./navbar-vertical.component.scss'],
})
export class NavbarVerticalComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<boolean>();
  @Input() isMobileVisible = false;
  isMobileView: boolean;

  navItems: any[] = [];
  isCollapsed = false;

  constructor(private router: Router, private navbarService: NavbarService) {
    // Check window width
    const windowWidth = window.innerWidth;
    this.isMobileView = windowWidth <= 768
    if (windowWidth <= 768) {
      this.isCollapsed = false;
      this.sidebarToggle.emit(this.isCollapsed);
    }
  }

  ngOnInit() {
    // Get navigation items from service
    this.navItems = this.navbarService.getNavbarItems();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
  }

  isActive(href: string): boolean {
    return this.router.url.includes(href);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const windowWidth = (event.target as Window).innerWidth;
    this.isMobileView  = windowWidth <= 768;
    if(this.isMobileView) {
      this.isCollapsed = false;
      // this.sidebarToggle.emit(this.isCollapsed);
    }
    // if (this.isCollapsed !== this.isMobileView) {
    //   this.isCollapsed = this.isMobileView;
    //   this.sidebarToggle.emit(this.isCollapsed);
    // }
  }
}
