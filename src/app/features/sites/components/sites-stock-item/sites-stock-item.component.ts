import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sites-stock-item',
  templateUrl: './sites-stock-item.component.html',
  styleUrls: ['./sites-stock-item.component.scss'],
})
export class SitesStockItemComponent {
  @Input() stocks!: any;
  @Input() siteId!: string;
  @Output() viewDetails = new EventEmitter<{productId: string, siteId: string}>();

  constructor(private router: Router) {}

  viewStockDetails(): void {
    if (this.stocks && this.stocks.productId && this.siteId) {
      this.viewDetails.emit({
        productId: this.stocks.productId,
        siteId: this.siteId
      });
    }
  }

  getTotalInPackage(packages: any[] | undefined): number {
    if (!packages || packages.length === 0) {
      return 0;
    }

    return packages.reduce((total, pkg) => {
      return total + (pkg.sizeAmount || 0);
    }, 0);
  }
}
