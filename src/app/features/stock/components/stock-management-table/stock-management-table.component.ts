import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StockHeaderModel } from '@models/stock.model';
import { ColDef, GridApi } from 'ag-grid-community';
import { SortOption } from 'src/app/shared-components/filter-panel/filter-panel.component';
import { ColumnConfig } from 'src/app/shared-components/expandable-card/expandable-card.component';

@Component({
  selector: 'app-stock-management-table',
  templateUrl: './stock-management-table.component.html',
  styleUrls: ['./stock-management-table.component.scss']
})
export class StockManagementTableComponent implements OnInit {
  @Input() data: StockHeaderModel[] = [];
  @Output() editStockEvent = new EventEmitter<StockHeaderModel>();
  @Output() deleteStockEvent = new EventEmitter<StockHeaderModel>();
  @Output() viewDetailEvent = new EventEmitter<StockHeaderModel>();

  columnDefs: ColDef[] = [];
  sortOptions: SortOption[] = [];

  // Card configuration for responsive view
  cardConfigs: { [key: string]: ColumnConfig[] } = {
    'STOCK': [
      { field: 'productName', label: 'Product Name', isHeader: true, icon: 'bi-box-seam' },
      { field: 'type', label: 'Type', isHeader: true },
      { field: 'sizeDescription', label: 'Size Description' },
      { field: 'totalSizeAmount', label: 'Total Size Amount' },
      { field: 'remainingStock', label: 'Remaining Stock' },
      { field: 'price', label: 'Price' },
      { field: 'siteName', label: 'Site' }
    ]
  };

  constructor() {}

  ngOnInit(): void {
    this.setupColumnDefs();
    this.setupSortOptions();
  }

  setupSortOptions(): void {
    this.sortOptions = [
      { field: 'productName', label: 'Product Name' },
      { field: 'type', label: 'Type' },
      { field: 'totalSizeAmount', label: 'Total Size Amount' },
      { field: 'remainingStock', label: 'Remaining Stock' },
      { field: 'price', label: 'Price' },
      { field: 'siteName', label: 'Site' }
    ];
  }

  setupColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'No',
        valueGetter: (params) => {
          return params.node?.rowIndex !== null ? params.node!.rowIndex + 1 : '';
        },
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        sortable: false,
        filter: false
      },
      { field: 'productName', headerName: 'Product Name' },
      { field: 'type', headerName: 'Type' },
      {
        field: 'sizeDescription',
        headerName: 'Size',
        valueFormatter: (params) => {
          if (!params.data) return '';
          return `${params.data.totalSizeAmount} ${params.data.sizeDescription}`;
        }
      },
      { field: 'remainingStock', headerName: 'Remaining Stock' },
      {
        field: 'price',
        headerName: 'Price',
        valueFormatter: (params) => {
          if (!params.data) return '';
          return this.formatPrice(params.data.price);
        }
      },
      { field: 'siteName', headerName: 'Site' },
      {
        headerName: 'Actions',
        cellRenderer: this.actionsRenderer.bind(this),
        cellRendererParams: {
          edit: this.editStock.bind(this),
          delete: this.deleteStock.bind(this),
          view: this.viewStockDetail.bind(this)
        },
        sortable: false,
        filter: false,
        width: 140,
        minWidth: 140,
        flex: 0.1
      }
    ];
  }

  actionsRenderer(params: any) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';

    const viewButton = document.createElement('button');
    viewButton.classList.add('btn', 'btn-sm', 'btn-info', 'me-1');
    viewButton.innerHTML = '<i class="bi bi-eye"></i>';
    viewButton.addEventListener('click', () => params.view(params.data));
    viewButton.style.padding = '0.25rem 0.5rem';

    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-sm', 'btn-primary', 'me-1');
    editButton.innerHTML = '<i class="bi bi-pencil"></i>';
    editButton.addEventListener('click', () => params.edit(params.data));
    editButton.style.padding = '0.25rem 0.5rem';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', () => params.delete(params.data));
    deleteButton.style.padding = '0.25rem 0.5rem';

    container.appendChild(viewButton);
    container.appendChild(editButton);
    container.appendChild(deleteButton);

    return container;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('IDR', 'Rp');
  }

  editStock(stock: StockHeaderModel): void {
    this.editStockEvent.emit(stock);
  }

  deleteStock(stock: StockHeaderModel): void {
    this.deleteStockEvent.emit(stock);
  }

  viewStockDetail(stock: StockHeaderModel): void {
    this.viewDetailEvent.emit(stock);
  }
}
