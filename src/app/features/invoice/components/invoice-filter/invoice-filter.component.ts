import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SiteService } from '@services/site.service';
import { UserManagementService } from '@services/user-management.service';
import { Customer } from '@models/user-management.model';
import { SiteOverviewList } from '@models/site.model';


export interface InvoiceFilter {
  customerId?: string;
  siteId?: string;
  status?: 'PENDING' | 'PAID' | 'CANCELLED' | '';
  startDate?: string;
  endDate?: string;
}

@Component({
  selector: 'app-invoice-filter',
  templateUrl: './invoice-filter.component.html',
  styleUrls: ['./invoice-filter.component.scss']
})
export class InvoiceFilterComponent implements OnInit {
  @Input() expanded: boolean = false;
  @Output() filterChange = new EventEmitter<InvoiceFilter>();
  @Output() toggleFilter = new EventEmitter<void>();

  filterForm: FormGroup;

  customers: Customer[] = [];
  sites: SiteOverviewList[] = [];
  isLoading: boolean = false;

  readonly statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService,
    private siteService: SiteService
  ) {
    this.filterForm = this.fb.group({
      customerId: [''],
      siteId: [''],
      status: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    // Listen for form changes
    this.filterForm.valueChanges.subscribe(values => {
      this.filterChange.emit(values);
    });

    // Load dropdown data
    this.loadCustomers();
    this.loadSites();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.userManagementService.inquiryCustomer().subscribe({
      next: (response) => {
        this.customers = response.customers;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadSites(): void {
    this.isLoading = true;
    this.siteService.getSiteForFilter().subscribe({
      next: (response) => {
        this.sites = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleExpanded(): void {
    this.toggleFilter.emit();
  }

  resetFilters(): void {
    this.filterForm.reset({
      customerId: '',
      siteId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  }

  applyFilters(): void {
    this.filterChange.emit(this.filterForm.value);
  }
}
