import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '@services/invoice.service';
import { Invoice, LineItem } from '@models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceNumber: string = '';
  invoice: Invoice | null = null;
  isLoading = false;
  error: string = '';

  breadcrumbs = [
    { label: 'Invoices', url: '/invoice' },
    { label: 'Invoice Details' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.invoiceNumber = params.get('id') || '';
      if (this.invoiceNumber) {
        this.loadInvoiceDetail();
      } else {
        this.error = 'Invoice number not provided';
      }
    });
  }

  loadInvoiceDetail(): void {
    this.isLoading = true;
    this.invoiceService.getInvoiceById(this.invoiceNumber).subscribe({
      next: (response) => {
        this.invoice = response.invoice;
        this.breadcrumbs[1].label = `Invoice #${this.invoiceNumber}`;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load invoice details';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/invoice']);
  }

  navigateToEdit(): void {
    this.router.navigate(['/invoice/edit', this.invoiceNumber]);
  }

  deleteInvoice(): void {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    this.isLoading = true;
    this.invoiceService.deleteInvoice(this.invoiceNumber).subscribe({
      next: () => {
        this.router.navigate(['/invoice']);
      },
      error: (error) => {
        this.error = error.message || 'Failed to delete invoice';
        this.isLoading = false;
      }
    });
  }

  updateStatus(status: 'PENDING' | 'PAID' | 'CANCELLED'): void {
    if (!this.invoice) return;

    const updateData = {
      invoiceNumber: this.invoice.invoiceNumber,
      customerId: this.invoice.customerId,
      siteId: this.invoice.siteId,
      dueDate: this.invoice.dueDate,
      notes: this.invoice.notes,
      status: status,
      changedBy: localStorage.getItem('username') || 'admin'
    };

    this.isLoading = true;
    this.invoiceService.updateInvoice(updateData).subscribe({
      next: () => {
        this.loadInvoiceDetail();
      },
      error: (error) => {
        this.error = error.message || 'Failed to update invoice status';
        this.isLoading = false;
      }
    });
  }

  downloadPdf(): void {
    this.isLoading = true;
    this.invoiceService.generateInvoicePdf(this.invoiceNumber).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${this.invoiceNumber}.pdf`;
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


  downloadPackingListPdf(): void {
    this.isLoading = true;
    this.invoiceService.generatePackListInvoicePdf(this.invoiceNumber).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-packing-list-${this.invoiceNumber}.pdf`;
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

  // Helper methods for formatting and data display
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'PAID': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    });
  }

  // Group line items by type for the summary
  getLineItemsByType(): { type: string, items: LineItem[], totalAmount: number, totalPrice: number }[] {
    if (!this.invoice?.lineItems) return [];

    const groupedItems: { [key: string]: LineItem[] } = {};

    for (const item of this.invoice.lineItems) {
      if (!groupedItems[item.type]) {
        groupedItems[item.type] = [];
      }
      groupedItems[item.type].push(item);
    }

    return Object.keys(groupedItems).map(type => {
      const items = groupedItems[type];
      const totalAmount = items.reduce((sum, item) => sum + item.unitAmount, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

      return { type, items, totalAmount, totalPrice };
    });
  }

  getTotalQuantity(): number {
    if (!this.invoice?.lineItems) return 0;
    return this.invoice.lineItems.reduce((sum, item) => sum + item.unitAmount, 0);
  }
}
