import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceService } from '@services/invoice.service';
import { InvoiceFilter } from '../../components/invoice-filter/invoice-filter.component';
import { Invoice } from '@models/invoice.model';

@Component({
  selector: 'app-invoice-index',
  templateUrl: './invoice-index.component.html',
  styleUrls: ['./invoice-index.component.scss']
})
export class InvoiceIndexComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  isLoading = false;
  error: string = '';
  showFilterPanel = false;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.invoiceService.getAllInvoices().subscribe({
      next: (response) => {
        this.invoices = response.invoices;
        this.filteredInvoices = [...this.invoices];
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load invoices';
        this.isLoading = false;
      }
    });
  }

  onFilterChanged(filters: InvoiceFilter): void {
    // Apply filters
    let filtered = [...this.invoices];

    // Filter by customer if selected
    if (filters.customerId) {
      filtered = filtered.filter(invoice =>
        invoice.customerId === filters.customerId
      );
    }

    // Filter by site if selected
    if (filters.siteId) {
      filtered = filtered.filter(invoice =>
        invoice.siteId === filters.siteId
      );
    }

    // Filter by status if selected
    if (filters.status) {
      filtered = filtered.filter(invoice =>
        invoice.status === filters.status
      );
    }

    // Filter by date range if both dates are selected
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    this.filteredInvoices = filtered;
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  navigateToCreate(): void {
    this.router.navigate(['/invoice/create']);
  }

  editInvoice(invoiceNumber: string): void {
    this.router.navigate(['/invoice/edit', invoiceNumber]);
  }

  deleteInvoice(invoiceNumber: string): void {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.isLoading = true;
      this.invoiceService.deleteInvoice(invoiceNumber).subscribe({
        next: () => {
          this.loadInvoices(); // Reload after delete
        },
        error: (error) => {
          this.error = error.message || 'Failed to delete invoice';
          this.isLoading = false;
        }
      });
    }
  }

  downloadPdf(invoiceNumber: string): void {
    this.isLoading = true;
    this.invoiceService.generateInvoicePdf(invoiceNumber).subscribe({
      next: (blob) => {
        // Create download link and click it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to download PDF';
        this.isLoading = false;
      }
    });
  }
}
