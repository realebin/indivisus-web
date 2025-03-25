import { Component, Input } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
})
export class BreadcrumbsComponent {
  @Input() breadcrumbs: { label: string; url?: string }[] = [];

  ngOnInit() {
    // console.log('BreadcrumbComponent initialized', this.breadcrumbs);
  }
}
