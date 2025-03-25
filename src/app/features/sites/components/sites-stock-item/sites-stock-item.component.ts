import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sites-stock-item',
  templateUrl: './sites-stock-item.component.html',
  styleUrls: ['./sites-stock-item.component.scss'],
})
export class SitesStockItemComponent {
  @Input() stocks!: any;

  getNestedPackageInfo(packages: any[] | undefined): string {
    if (!packages || packages.length === 0) {
      return 'No packages available';
    }

    return packages
      .map((pkg) => {
        const sizeInfo = `${pkg.sizeDescription} - ${pkg.sizeAmount}`;
        const quantityInfo = pkg.quantity ? ` (x${pkg.quantity})` : '';

        // Recursively handle nested packages (smaller and smallest)
        let nestedInfo = '';
        if (pkg.smallerPackages && pkg.smallerPackages.length > 0) {
          nestedInfo +=
            '<br>&nbsp;&nbsp;&nbsp;<i>Smaller:</i><br>' +
            this.getNestedPackageInfo(pkg.smallerPackages);
        }
        if (pkg.theSmallestPackages && pkg.theSmallestPackages.length > 0) {
          nestedInfo +=
            '<br>&nbsp;&nbsp;&nbsp;<i>Smallest:</i><br>' +
            this.getNestedPackageInfo(pkg.theSmallestPackages);
        }

        return `${sizeInfo}${quantityInfo}${nestedInfo ? nestedInfo : ''}`;
      })
      .join('<br>');
  }
}
