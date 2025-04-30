import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SiteService } from '@services/site.service';
import { StockManagementService } from '@services/stock.service';
import { InvoiceService } from '@services/invoice.service';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Register Chart.js components
Chart.register(...registerables);

// Create interface with explicit properties to avoid index signature errors
interface StockStat {
  total: number;
  unit: string;
  trend: number;  // Positive or negative percentage
}

interface StockStats {
  // Define explicit properties for known types
  kain?: StockStat;
  tali?: StockStat;
  // Allow other types via index signature
  [type: string]: StockStat | undefined;
}

interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
  growth: number;
  percentage: number; // For progress bar
  iconClass: string;
}

@Component({
  selector: 'app-dashboard-info',
  templateUrl: './dashboard-info.component.html',
  styleUrls: ['./dashboard-info.component.scss'],
})
export class DashboardInfoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('revenueCanvas') revenueCanvas: ElementRef;
  @ViewChild('itemsCanvas') itemsCanvas: ElementRef;
  
  // Chart instances
  private revenueChart?: Chart;
  private itemsChart?: Chart;
  
  // User info
  name = localStorage.getItem('name') || 'User';
  
  // Stats data
  siteCount = 0;
  siteTrend = 12; // Default value
  invoiceCount = 0;
  invoiceTrend = 8; // Default value
  stockStats: StockStats = {};
  otherStockTypes: string[] = [];
  
  // Top selling items
  topSellingItems: TopSellingItem[] = [];
  
  // Revenue chart controls
  revenuePeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  currentYear = new Date().getFullYear();
  
  // Loading state
  loading = true;
  error: string | null = null;
  
  // For template usage
  Math = Math; // Make Math available in the template
  
  // Subscriptions to clean up
  private subscriptions: Subscription[] = [];

  constructor(
    private siteService: SiteService,
    private stockService: StockManagementService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is initialized and data is loaded
    if (!this.loading && !this.error) {
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Destroy charts to prevent memory leaks
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    
    if (this.itemsChart) {
      this.itemsChart.destroy();
    }
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    // Create observables for each data type we need to fetch
    const sites$ = this.siteService.getAllSites().pipe(
      catchError(error => {
        console.error('Error loading sites:', error);
        return of({ data: [] });
      })
    );
    
    const stocks$ = this.stockService.getAllStocks().pipe(
      catchError(error => {
        console.error('Error loading stocks:', error);
        return of([]);
      })
    );
    
    const invoices$ = this.invoiceService.getAllInvoices().pipe(
      catchError(error => {
        console.error('Error loading invoices:', error);
        return of({ epoch: 0, invoices: [] });
      })
    );
    
    // Combine all requests and process data when they complete
    const subscription = forkJoin({
      sites: sites$,
      stocks: stocks$,
      invoices: invoices$
    }).subscribe({
      next: (results) => {
        // Process sites data
        this.siteCount = results.sites.data.length;
        
        // Process invoices data
        this.invoiceCount = results.invoices.invoices.length;
        
        // Process stocks data
        this.processStockData(results.stocks);
        
        // Process sales data for top items and revenue chart
        this.processInvoiceData(results.invoices.invoices);
        
        this.loading = false;

        // Initialize charts after data is loaded
        setTimeout(() => {
          this.initializeCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.loading = false;
      }
    });
    
    this.subscriptions.push(subscription);
  }

  private processStockData(stocks: any[]): void {
    // Group stocks by type
    const stocksByType: { [type: string]: { total: number, unit: string, items: any[] } } = {};
    
    stocks.forEach(stock => {
      const type = stock.type.toLowerCase();
      const unitMatch = stock.sizeDescription?.match(/[A-Za-z]+$/i);
      const unit = unitMatch ? unitMatch[0] : '';
      
      if (!stocksByType[type]) {
        stocksByType[type] = {
          total: 0,
          unit: unit,
          items: []
        };
      }
      
      stocksByType[type].total += stock.remainingStock || 0;
      stocksByType[type].items.push(stock);
    });
    
    // Convert to the format needed for the UI with explicit properties
    this.stockStats = {};
    
    Object.keys(stocksByType).forEach(type => {
      // Generate a random trend percentage for demonstration
      // In a real app, you would calculate this from historical data
      const trend = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 20 + 5);
      
      // Set as an explicit property if known type, otherwise use index notation
      const stockStat = {
        total: stocksByType[type].total,
        unit: stocksByType[type].unit || '',
        trend: trend
      };
      
      if (type === 'kain') {
        this.stockStats.kain = stockStat;
      } else if (type === 'tali') {
        this.stockStats.tali = stockStat;
      } else {
        this.stockStats[type] = stockStat;
      }
    });
    
    // Handle special cases for Kain and Tali, and collect other types
    this.otherStockTypes = Object.keys(this.stockStats)
      .filter(type => type !== 'kain' && type !== 'tali');
  }

  private processInvoiceData(invoices: any[]): void {
    // Skip if no invoices
    if (!invoices || invoices.length === 0) {
      return;
    }
    
    // Process invoices to get top selling items
    const itemSales: { [key: string]: { quantity: number, revenue: number, type: string } } = {};
    
    invoices.forEach(invoice => {
      if (invoice.lineItems && Array.isArray(invoice.lineItems)) {
        invoice.lineItems.forEach((item: any) => {
          const key = item.productName || 'Unknown Product';
          
          if (!itemSales[key]) {
            itemSales[key] = {
              quantity: 0,
              revenue: 0,
              type: item.type || ''
            };
          }
          
          itemSales[key].quantity += item.unitAmount || 0;
          itemSales[key].revenue += item.totalPrice || 0;
        });
      }
    });
    
    // Convert to array and sort by revenue
    const items = Object.keys(itemSales).map(name => ({
      name,
      quantity: itemSales[name].quantity,
      revenue: itemSales[name].revenue,
      type: itemSales[name].type
    }));
    
    items.sort((a, b) => b.revenue - a.revenue);
    
    // Take top 5 items
    const topItems = items.slice(0, 5);
    
    // Find the max revenue for percentage calculation
    const maxRevenue = topItems.length > 0 ? topItems[0].revenue : 1;
    
    // Convert to the format needed for the UI
    this.topSellingItems = topItems.map((item, index) => {
      // Assign different icon classes based on index
      const iconClasses = ['light-blue', 'light-orange', 'light-green', 'light-purple', 'light-warning'];
      
      return {
        name: item.name,
        quantity: item.quantity,
        revenue: item.revenue,
        growth: Math.floor(Math.random() * 25) + 5, // Random growth percentage for demo
        percentage: Math.max(20, (item.revenue / maxRevenue) * 100), // Min 20% for visual appeal
        iconClass: iconClasses[index % iconClasses.length]
      };
    });
  }

  private initializeCharts(): void {
    this.initRevenueChart();
    this.initItemsChart();
  }

  private initRevenueChart(): void {
    if (!this.revenueCanvas) {
      console.warn('Revenue canvas element not found');
      return;
    }
    
    const canvas = this.revenueCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.warn('Could not get 2D context from revenue canvas');
      return;
    }
    
    // Generate some example revenue data
    // In a real application, this would be calculated from invoice data
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const thisYearData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 10);
    const lastYearData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 5);
    
    // Destroy previous instance if it exists
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    
    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: `${this.currentYear}`,
            data: thisYearData,
            backgroundColor: 'rgba(105, 108, 255, 0.8)',
            borderRadius: 4,
          },
          {
            label: `${this.currentYear - 1}`,
            data: lastYearData,
            backgroundColor: 'rgba(3, 195, 236, 0.8)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  private initItemsChart(): void {
    if (!this.itemsCanvas) {
      console.warn('Items canvas element not found');
      return;
    }
    
    const canvas = this.itemsCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.warn('Could not get 2D context from items canvas');
      return;
    }
    
    // Generate some example data
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [50, 40, 60, 75, 65, 70];
    
    // Destroy previous instance if it exists
    if (this.itemsChart) {
      this.itemsChart.destroy();
    }
    
    this.itemsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales Trend',
          data: data,
          borderColor: '#ffab00',
          backgroundColor: 'rgba(255, 171, 0, 0.1)',
          fill: true,
          tension: 0.4,
          pointStyle: 'circle',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 20
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // UI helper methods
  setRevenuePeriod(period: 'monthly' | 'quarterly' | 'yearly'): void {
    if (this.revenuePeriod === period) return;
    
    this.revenuePeriod = period;
    
    // In a real application, you would fetch new data based on the selected period
    // For this example, we'll just update the chart with random data
    
    const labels = this.getLabelsForPeriod(period);
    const thisYearData = Array.from({ length: labels.length }, () => Math.floor(Math.random() * 50) + 10);
    const lastYearData = Array.from({ length: labels.length }, () => Math.floor(Math.random() * 40) + 5);
    
    if (this.revenueChart) {
      this.revenueChart.data.labels = labels;
      this.revenueChart.data.datasets[0].data = thisYearData;
      this.revenueChart.data.datasets[1].data = lastYearData;
      this.revenueChart.update();
    }
  }

  private getLabelsForPeriod(period: 'monthly' | 'quarterly' | 'yearly'): string[] {
    switch (period) {
      case 'monthly':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'quarterly':
        return ['Q1', 'Q2', 'Q3', 'Q4'];
      case 'yearly':
        return [String(this.currentYear - 4), String(this.currentYear - 3), String(this.currentYear - 2), String(this.currentYear - 1), String(this.currentYear)];
    }
  }

  getIconClass(type: string): string {
    // Assign a color class based on the stock type
    const classes = ['light-blue', 'light-orange', 'light-green', 'light-purple', 'light-warning'];
    const index = Math.abs(type.charCodeAt(0)) % classes.length;
    return classes[index];
  }
}