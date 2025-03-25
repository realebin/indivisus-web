import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockHeaderModel } from '@models/stock.model';

@Component({
  selector: 'app-stock-lists',
  templateUrl: './stock-lists.component.html',
  styleUrls: ['./stock-lists.component.scss'],
})
export class StockListsComponent implements OnInit {
  @Input() stocks: StockHeaderModel[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  getFormattedSizes(stock: StockHeaderModel): string {
    if (!stock.totalSizeAmount) return 'N/A';
    return `${stock.totalSizeAmount} ${stock.sizeDescription || ''}`;
  }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  navigateToStockDetail(stockId: string): void {
    this.router.navigate(['/stock/detail', stockId]);
  }

  editStock(stockId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/stock/edit', stockId]);
  }

  deleteStock(stockId: string, event: Event): void {
    event.stopPropagation();
    // Implement delete confirmation handling here
    if (confirm('Are you sure you want to delete this stock?')) {
      // Stock deletion will be handled by the parent component
      this.router.navigate(['/stock']);
    }
  }
}
