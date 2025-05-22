import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SiteService } from '@services/site.service';
import { StockManagementService } from '@services/stock.service';
import { InvoiceService } from '@services/invoice.service';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Register Chart.js components
Chart.register(...registerables);

interface StockStat {
  total: number;
  unit: string;
  trend: number;
}

interface StockStats {
  kain?: StockStat;
  tali?: StockStat;
  [type: string]: StockStat | undefined;
}

interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
  growth: number;
  percentage: number;
  iconClass: string;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  year: number;
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
  
  // Month names for chart labels
  private readonly monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // User info
  name = localStorage.getItem('name') || 'User';
  
  // Stats data
  siteCount = 0;
  siteTrend = 0;
  invoiceCount = 0;
  invoiceTrend = 0;
  stockStats: StockStats = {};
  otherStockTypes: string[] = [];
  
  // Revenue data
  private monthlyRevenueData: MonthlyRevenue[] = [];
  
  // Top selling items
  topSellingItems: TopSellingItem[] = [];
  
  // Revenue chart controls
  revenuePeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  currentYear = new Date().getFullYear();
  
  // Loading state
  loading = true;
  error: string | null = null;
  
  // For template usage
  Math = Math;
  
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
    
    // Create observables for each data type
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
    
    // Combine all requests
    const subscription = forkJoin({
      sites: sites$,
      stocks: stocks$,
      invoices: invoices$
    }).subscribe({
      next: (results) => {
        this.processSitesData(results.sites.data);
        this.processStockData(results.stocks);
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

  private processSitesData(sites: any[]): void {
    this.siteCount = sites.length;
    
    // Calculate site trend - you can implement logic based on creation dates
    // For now, using a simple calculation based on recent additions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthSites = sites.filter(site => {
      const createdDate = new Date(site.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthSites = sites.filter(site => {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const createdDate = new Date(site.createdAt);
      return createdDate.getMonth() === lastMonth && createdDate.getFullYear() === lastMonthYear;
    }).length;
    
    if (lastMonthSites > 0) {
      this.siteTrend = Math.round(((thisMonthSites - lastMonthSites) / lastMonthSites) * 100);
    } else {
      this.siteTrend = thisMonthSites > 0 ? 100 : 0;
    }
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
    
    // Convert to the format needed for the UI
    this.stockStats = {};
    
    Object.keys(stocksByType).forEach(type => {
      // Calculate trend based on recent stock changes
      // This is a simplified calculation - you might want to store historical data for accurate trends
      const items = stocksByType[type].items;
      let trend = 0;
      
      if (items.length > 0) {
        // Simple trend calculation based on stock levels vs expected levels
        const avgStock = stocksByType[type].total / items.length;
        // Assume a baseline of 100 units per item for trend calculation
        const expectedStock = items.length * 100;
        trend = Math.round(((stocksByType[type].total - expectedStock) / expectedStock) * 100);
      }
      
      const stockStat = {
        total: stocksByType[type].total,
        unit: stocksByType[type].unit || 'Units',
        trend: Math.max(-100, Math.min(100, trend)) // Cap between -100% and 100%
      };
      
      if (type === 'kain') {
        this.stockStats.kain = stockStat;
      } else if (type === 'tali') {
        this.stockStats.tali = stockStat;
      } else {
        this.stockStats[type] = stockStat;
      }
    });
    
    // Collect other types
    this.otherStockTypes = Object.keys(this.stockStats)
      .filter(type => type !== 'kain' && type !== 'tali');
  }

  private processInvoiceData(invoices: any[]): void {
    this.invoiceCount = invoices.length;
    
    // Calculate invoice trend
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthInvoices = invoices.filter(invoice => {
      const createdDate = new Date(invoice.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthInvoices = invoices.filter(invoice => {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const createdDate = new Date(invoice.createdAt);
      return createdDate.getMonth() === lastMonth && createdDate.getFullYear() === lastMonthYear;
    }).length;
    
    if (lastMonthInvoices > 0) {
      this.invoiceTrend = Math.round(((thisMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100);
    } else {
      this.invoiceTrend = thisMonthInvoices > 0 ? 100 : 0;
    }
    
    // Process revenue data
    this.processRevenueData(invoices);
    
    // Process top selling items
    this.processTopSellingItems(invoices);
  }

  private processRevenueData(invoices: any[]): void {
    // Group invoices by month and calculate revenue
    const revenueByMonth: { [key: string]: number } = {};
    
    invoices.forEach(invoice => {
      const createdDate = new Date(invoice.createdAt);
      const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
      
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = 0;
      }
      
      revenueByMonth[monthKey] += invoice.totalPrice || 0;
    });
    
    // Convert to array format for charts
    this.monthlyRevenueData = Object.keys(revenueByMonth).map(key => {
      const [year, month] = key.split('-').map(Number);
      
      return {
        month: this.monthNames[month],
        revenue: revenueByMonth[key],
        year: year
      };
    }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return this.monthNames.indexOf(a.month) - this.monthNames.indexOf(b.month);
    });
  }

  private processTopSellingItems(invoices: any[]): void {
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
    
    // Take top 4 items
    const topItems = items.slice(0, 4);
    
    // Find the max revenue for percentage calculation
    const maxRevenue = topItems.length > 0 ? topItems[0].revenue : 1;
    
    // Convert to the format needed for the UI
    this.topSellingItems = topItems.map((item, index) => {
      const iconClasses = ['light-blue', 'light-orange', 'light-green', 'light-purple'];
      
      // Calculate growth based on comparison with average
      const avgRevenue = items.reduce((sum, i) => sum + i.revenue, 0) / items.length;
      const growth = avgRevenue > 0 ? Math.round(((item.revenue - avgRevenue) / avgRevenue) * 100) : 0;
      
      return {
        name: item.name,
        quantity: item.quantity,
        revenue: item.revenue,
        growth: Math.max(0, growth), // Only show positive growth
        percentage: Math.max(20, (item.revenue / maxRevenue) * 100),
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
    
    // Destroy previous instance if it exists
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    
    const chartData = this.getRevenueChartData();
    
    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
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
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: Rp.${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return 'Rp.' + Number(value).toLocaleString();
              }
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

  private getRevenueChartData(): any {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (this.revenuePeriod === 'quarterly') {
      return this.getQuarterlyData();
    } else if (this.revenuePeriod === 'yearly') {
      return this.getYearlyData();
    }
    
    // Monthly data (default)
    const currentYearData = new Array(12).fill(0);
    const lastYearData = new Array(12).fill(0);
    
    this.monthlyRevenueData.forEach(data => {
      const monthIndex = labels.indexOf(data.month);
      if (monthIndex !== -1) {
        if (data.year === this.currentYear) {
          currentYearData[monthIndex] = data.revenue;
        } else if (data.year === this.currentYear - 1) {
          lastYearData[monthIndex] = data.revenue;
        }
      }
    });
    
    return {
      labels: labels,
      datasets: [
        {
          label: `${this.currentYear}`,
          data: currentYearData,
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
    };
  }

  private getQuarterlyData(): any {
    const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentYearData = new Array(4).fill(0);
    const lastYearData = new Array(4).fill(0);
    
    this.monthlyRevenueData.forEach(data => {
      const monthIndex = this.monthNames.indexOf(data.month);
      const quarterIndex = Math.floor(monthIndex / 3);
      
      if (data.year === this.currentYear) {
        currentYearData[quarterIndex] += data.revenue;
      } else if (data.year === this.currentYear - 1) {
        lastYearData[quarterIndex] += data.revenue;
      }
    });
    
    return {
      labels: labels,
      datasets: [
        {
          label: `${this.currentYear}`,
          data: currentYearData,
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
    };
  }

  private getYearlyData(): any {
    const currentYear = this.currentYear;
    const labels = [String(currentYear - 4), String(currentYear - 3), String(currentYear - 2), String(currentYear - 1), String(currentYear)];
    const yearlyData = new Array(5).fill(0);
    
    // Group monthly data by year
    const revenueByYear: { [year: number]: number } = {};
    this.monthlyRevenueData.forEach(data => {
      if (!revenueByYear[data.year]) {
        revenueByYear[data.year] = 0;
      }
      revenueByYear[data.year] += data.revenue;
    });
    
    // Fill the yearly data array
    labels.forEach((yearLabel, index) => {
      const year = parseInt(yearLabel);
      yearlyData[index] = revenueByYear[year] || 0;
    });
    
    return {
      labels: labels,
      datasets: [
        {
          label: 'Revenue',
          data: yearlyData,
          backgroundColor: 'rgba(105, 108, 255, 0.8)',
          borderRadius: 4,
        }
      ]
    };
  }

  private initItemsChart(): void {
    if (!this.itemsCanvas || this.topSellingItems.length === 0) {
      return;
    }
    
    const canvas = this.itemsCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }
    
    // Destroy previous instance if it exists
    if (this.itemsChart) {
      this.itemsChart.destroy();
    }
    
    // Create trend line data based on monthly sales
    const last6Months = this.monthlyRevenueData.slice(-6);
    const labels = last6Months.map(data => data.month);
    const data = last6Months.map(data => data.revenue / 1000); // Convert to thousands
    
    this.itemsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue Trend (K)',
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
            callbacks: {
              label: function(context) {
                return `Rp.${(context.parsed.y * 1000).toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return 'Rp.' + Number(value) + 'K';
              }
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
    
    // Update the chart with new data
    if (this.revenueChart) {
      const newData = this.getRevenueChartData();
      this.revenueChart.data = newData;
      this.revenueChart.update();
    }
  }

  getIconClass(type: string): string {
    const classes = ['light-blue', 'light-orange', 'light-green', 'light-purple', 'light-warning'];
    const index = Math.abs(type.charCodeAt(0)) % classes.length;
    return classes[index];
  }
}