// invoice-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '@services/invoice.service';

import { AuthService } from '@services/auth.service';
import { InvoiceFormData } from '../invoice-form/invoice-form.component';

@Component({
  selector: 'app-invoice-edit',
  templateUrl: './invoice-edit.component.html',
  styleUrls: ['./invoice-edit.component.scss']
})
export class InvoiceEditComponent implements OnInit {
  invoiceNumber: string = '';
  initialData: InvoiceFormData | null = null;
  isLoading = false;
  error: string = '';
  
  // Breadcrumbs for navigation
  breadcrumbs = [
    { label: 'Invoices', url: '/invoice' },
    { label: 'Edit Invoice' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.invoiceNumber = id;
        this.loadInvoiceForEdit();
      } else {
        this.error = 'Invoice ID not provided';
      }
    });
  }

  loadInvoiceForEdit(): void {
    this.isLoading = true;
    this.invoiceService.getInvoiceById(this.invoiceNumber).subscribe({
      next: (response) => {
        const invoice = response.invoice;
        
        // Format data for the form component
        this.initialData = {
          customerId: invoice.customerId,
          siteId: invoice.siteId,
          dueDate: this.formatDateForInput(invoice.dueDate),
          notes: invoice.notes,
          status: invoice.status,
          lineItems: invoice.lineItems.map(item => ({
            stockId: item.stockId,
            productId: item.productId,
            bigPackageNumber: item.bigPackageNumber,
            smallPackageId: item.smallPackageId,
            unitAmount: item.unitAmount,
            unitPrice: item.unitPrice,
            productName: item.productName,
            type: item.type,
            sizeDescription: item.sizeDescription,
            // Initialize multi-select support properties
            _selectedSmallPackages: item.smallPackageId ? [item.smallPackageId] : []
          }))
        };
        
        this.breadcrumbs[1].label = `Edit Invoice #${this.invoiceNumber}`;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load invoice data';
        this.isLoading = false;
      }
    });
  }
  
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(formData: InvoiceFormData): void {
    // Create update data with invoice number and changed by user
    const updateData = {
      invoiceNumber: this.invoiceNumber,
      customerId: formData.customerId,
      siteId: formData.siteId,
      dueDate: formData.dueDate,
      notes: formData.notes,
      status: formData.status || 'PENDING',
      changedBy: this.authService.getUsername() || 'admin'
    };

    this.isLoading = true;
    this.invoiceService.updateInvoice(updateData).subscribe({
      next: () => {
        this.router.navigate(['/invoice/detail', this.invoiceNumber]);
      },
      error: (error) => {
        this.error = error.message || 'Error updating invoice';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/invoice/detail', this.invoiceNumber]);
  }
}