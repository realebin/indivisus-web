import { Component, Input } from '@angular/core';
import { StockItems } from '@models/stock.model'; // Import the model

@Component({
  selector: 'app-stock-lists',
  templateUrl: './stock-lists.component.html',
  styleUrls: ['./stock-lists.component.scss'],
})
export class StockListsComponent {
  @Input() stocks: StockItems[] = [];

  getFormattedSizes(bigPackage: any): string {
    return bigPackage?.sizes?.map((size: any) =>
      `${size.sizeDescription || 'N/A'} ${size.sizeAmount || 0}`
    ).join(', ') || 'N/A';
  }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
