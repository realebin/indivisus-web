import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Invoice } from '@models/invoice.model';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  @Input() invoices: Invoice[] = [];
  @Output() editInvoice = new EventEmitter<string>();
  @Output() deleteInvoice = new EventEmitter<string>();
  @Output() viewPdf = new EventEmitter<string>();

  columnDefs: ColDef[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.setupColumnDefs();
  }

  setupColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'Invoice #',
        field: 'invoiceNumber',
        sortable: true,
        filter: true,
        resizable: true,
        cellRenderer: (params: any) => {
          return `<a href="javascript:void(0)" class="invoice-link text-primary">${params.value}</a>`;
        }
      },
      {
        headerName: 'Customer',
        field: 'customerName',
        sortable: true,
        filter: true,
        resizable: true
      },
      {
        headerName: 'Site',
        field: 'siteName',
        sortable: true,
        filter: true,
        resizable: true
      },
      {
        headerName: 'Date',
        field: 'createdAt',
        sortable: true,
        filter: true,
        resizable: true,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          return date.toLocaleDateString();
        }
      },
      {
        headerName: 'Due Date',
        field: 'dueDate',
        sortable: true,
        filter: true,
        resizable: true,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          return date.toLocaleDateString();
        }
      },
      {
        headerName: 'Total',
        field: 'totalPrice',
        sortable: true,
        filter: true,
        resizable: true,
        valueFormatter: (params) => {
          if (params.value === null || params.value === undefined) return '';
          return params.value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
        }
      },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        filter: true,
        resizable: true,
        cellRenderer: (params: any) => {
          let badgeClass = '';
          switch (params.value) {
            case 'PENDING':
              badgeClass = 'bg-warning';
              break;
            case 'PAID':
              badgeClass = 'bg-success';
              break;
            case 'CANCELLED':
              badgeClass = 'bg-danger';
              break;
            default:
              badgeClass = 'bg-secondary';
          }
          return `<span class="badge ${badgeClass}">${params.value}</span>`;
        }
      },
      {
        headerName: 'Actions',
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          return `
            <div class="d-flex">
              <button class="btn btn-sm btn-primary me-1 edit-btn" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger me-1 delete-btn" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
              <button class="btn btn-sm btn-secondary pdf-btn" title="Download PDF">
                <i class="bi bi-file-pdf"></i>
              </button>
            </div>
          `;
        }
      }
    ];
  }

  onCellClicked(event: any): void {
    const column = event.colDef.field;
    const invoiceNumber = event.data.invoiceNumber;

    // Handle invoice link click
    if (column === 'invoiceNumber') {
      this.navigateToDetail(invoiceNumber);
      return;
    }

    // Handle action buttons
    if (event.event.target.closest('.edit-btn')) {
      this.onEdit(invoiceNumber);
    } else if (event.event.target.closest('.delete-btn')) {
      this.onDelete(invoiceNumber);
    } else if (event.event.target.closest('.pdf-btn')) {
      this.onViewPdf(invoiceNumber);
    }
  }

  navigateToDetail(invoiceNumber: string): void {
    this.router.navigate(['/invoice/detail', invoiceNumber]);
  }

  onEdit(invoiceNumber: string): void {
    this.editInvoice.emit(invoiceNumber);
  }

  onDelete(invoiceNumber: string): void {
    this.deleteInvoice.emit(invoiceNumber);
  }

  onViewPdf(invoiceNumber: string): void {
    this.viewPdf.emit(invoiceNumber);
  }

  // Convert status to badge color
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'PAID':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  // Format date
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Format currency
  formatCurrency(value: number): string {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
  }
}
