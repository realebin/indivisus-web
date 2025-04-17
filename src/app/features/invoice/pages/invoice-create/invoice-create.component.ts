// invoice-create.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceService } from '@services/invoice.service';

import { AuthService } from '@services/auth.service';
import { InvoiceFormData } from '@features/invoice/components';

@Component({
  selector: 'app-invoice-create',
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.scss']
})
export class InvoiceCreateComponent implements OnInit {
  isLoading = false;
  error: string = '';
  
  // Breadcrumbs for navigation
  breadcrumbs = [
    { label: 'Invoices', url: '/invoice' },
    { label: 'Create Invoice' }
  ];

  constructor(
    private router: Router,
    private invoiceService: InvoiceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Any initialization needed
  }

  onSubmit(formData: InvoiceFormData): void {
    // Add current user as createdBy
    const createData = {
      ...formData,
      createdBy: this.authService.getUsername() || 'admin'
    };

    this.isLoading = true;
    this.invoiceService.createInvoice(createData).subscribe({
      next: () => {
        this.router.navigate(['/invoice']);
      },
      error: (error) => {
        this.error = error.message || 'Error creating invoice';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/invoice']);
  }
}