import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '@models/user-management.model';
import { SiteOverviewList } from '@models/site.model';
import { ProductForInvoice } from '@models/invoice.model';
import { UserManagementService } from '@services/user-management.service';
import { SiteService } from '@services/site.service';
import { InvoiceService } from '@services/invoice.service';

interface LineItem {
  stockId: string;
  productId: string;
  bigPackageNumber: string;
  smallPackageId: string;
  unitAmount: number;
  unitPrice: number;
  // Optional display properties
  productName?: string;
  type?: string;
}

@Component({
  selector: 'app-invoice-create',
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.scss']
})
export class InvoiceCreateComponent implements OnInit {
  invoiceForm: FormGroup;
  isEditMode = false;
  invoiceNumber: string = '';
  isLoading = false;
  error: string = '';

  // Data for dropdowns
  customers: Customer[] = [];
  sites: SiteOverviewList[] = [];
  products: ProductForInvoice[] = [];

  // Line items
  lineItems: LineItem[] = [];

  // Selected product cache for each line item
  selectedProducts: { [index: number]: ProductForInvoice | null } = {};
  selectedBigPackages: { [index: number]: any | null } = {};

  breadcrumbs = [
    { label: 'Invoices', url: '/invoice' },
    { label: 'Create Invoice' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private userManagementService: UserManagementService,
    private siteService: SiteService
  ) {
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      siteId: ['', Validators.required],
      dueDate: ['', Validators.required],
      notes: [''],
      status: ['PENDING']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadSites();

    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.invoiceNumber = id;
        this.breadcrumbs[1].label = 'Edit Invoice';
        this.loadInvoiceForEdit();
      }
    });

    // Handle site change to load products
    this.invoiceForm.get('siteId')?.valueChanges.subscribe(siteId => {
      if (siteId) {
        this.loadProducts(siteId);
      }
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.userManagementService.inquiryCustomer().subscribe({
      next: (response) => {
        this.customers = response.customers;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load customers';
        this.isLoading = false;
      }
    });
  }

  loadSites(): void {
    this.isLoading = true;

