/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prefer-const */
import { Component, EventEmitter, Input, OnInit, OnChanges, OnDestroy, Output, SimpleChanges, ContentChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ColumnConfig } from 'src/app/shared-components/expandable-card/expandable-card.component';
import { SortOption } from '../filter-panel/filter-panel.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-responsive-data-table',
  templateUrl: './responsive-data-table.component.html',
  styleUrls: ['./responsive-data-table.component.scss'],
})
export class ResponsiveDataTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() cardConfigs: { [key: string]: ColumnConfig[] } = {};
  @Input() type: string = '';
  @Input() sortOptions: SortOption[] = [];
  @Input() title: string = 'Data Table';

  @Output() editItem = new EventEmitter<any>();
  @Output() deleteItem = new EventEmitter<any>();
  @Output() gridReady = new EventEmitter<GridApi>();

  @ContentChild('footerTemplate') footerTemplate!: TemplateRef<any>;

  // Mobile filtering
  searchFilter = new FormControl('');
  filteredData: any[] = [];
  showFilterPanel = false;

  // Mobile sorting
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // AG Grid properties
  private gridApi!: GridApi;
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 120,
  };

  // Pagination
  pageSize = 10;
  pagination = true;

  // Cleanup subscription
  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit(): void {
    this.filteredData = [...this.data];

    // Set up search filter subscription
    this.searchFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.filterData(value || '');
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.filteredData = [...this.data];

      // Reset sorting and filtering when data changes
      this.sortField = '';
      this.sortDirection = 'asc';
      this.searchFilter.setValue('', {emitEvent: false});
      this.showFilterPanel = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Remove window resize listener
    window.removeEventListener('resize', this.onWindowResize);
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  // Handle sort change from filter panel
  onSortChange(event: {field: string}): void {
    this.sortData(event.field);
  }

  // Mobile sorting
  sortData(field: string): void {
    // If clicking the same field, toggle sort direction
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    // Apply sorting to filteredData
    this.applySort();
  }

  applySort(): void {
    if (!this.sortField) {
      return;
    }

    this.filteredData = [...this.filteredData].sort((a, b) => {
      // Handle null or undefined values
      if (a[this.sortField] === null || a[this.sortField] === undefined) return this.sortDirection === 'asc' ? -1 : 1;
      if (b[this.sortField] === null || b[this.sortField] === undefined) return this.sortDirection === 'asc' ? 1 : -1;

      // String comparison for case-insensitive sorting
      const valueA = a[this.sortField].toString().toLowerCase();
      const valueB = b[this.sortField].toString().toLowerCase();

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  filterData(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredData = [...this.data];
    } else {
      const lowercaseTerm = searchTerm.toLowerCase();

      this.filteredData = this.data.filter((item: any) => {
        // Check all properties of the item for matches
        return Object.keys(item).some(key => {
          // Skip id and non-string/number values
          if (key === 'id' || item[key] === null || item[key] === undefined) {
            return false;
          }

          const value = item[key].toString().toLowerCase();
          return value.includes(lowercaseTerm);
        });
      });
    }

    // Reapply sorting after filtering
    this.applySort();
  }

  resetFilters(): void {
    this.searchFilter.setValue('');
    this.sortField = '';
    this.sortDirection = 'asc';
    this.filteredData = [...this.data];
  }

  // Improved window resize handler
  private onWindowResize = (): void => {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  };

  // onGridReady(params: GridReadyEvent) {
  //   this.gridApi = params.api;
  //   this.gridReady.emit(this.gridApi);

  //   // Initial column sizing
  //   setTimeout(() => {
  //     params.api.sizeColumnsToFit();
  //   });

  //   // Set up window resize listener
  //   window.addEventListener('resize', this.onWindowResize);

  //   // Set up ResizeObserver for container
  //   const gridElement = document.querySelector('.ag-theme-alpine');
  //   if (gridElement && window.ResizeObserver) {
  //     this.resizeObserver = new ResizeObserver(() => {
  //       setTimeout(() => {
  //         if (this.gridApi) {
  //           this.gridApi.sizeColumnsToFit();
  //         }
  //       }, 100);
  //     });

  //     this.resizeObserver.observe(gridElement);
  //   }
  // }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridReady.emit(this.gridApi);

    // Delay the initial sizing to ensure the container is rendered
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();

        // Force a refresh of the grid
        this.gridApi.redrawRows();
      }
    }, 100);

    // Set up window resize listener
    window.addEventListener('resize', this.onWindowResize);
  }

  public refreshGrid(): void {
    if (this.gridApi) {
      // First update row data
      this.gridApi.setGridOption('rowData', this.data);

      // Then manually trigger column resize
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
        this.gridApi.redrawRows();
      }, 50);
    }
  }

  // Actions
  onEdit(item: any): void {
    this.editItem.emit(item);
  }

  onDelete(item: any): void {
    this.deleteItem.emit(item);
  }

  // Get text to display active filters
  getActiveFilterText(): string {
    let filters = [];

    if (this.searchFilter.value) {
      filters.push(`Search: "${this.searchFilter.value}"`);
    }

    if (this.sortField) {
      const sortOption = this.sortOptions.find(opt => opt.field === this.sortField);
      if (sortOption) {
        filters.push(`Sort: ${sortOption.label} (${this.sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`);
      }
    }

    return filters.join(', ');
  }

  hasActiveFilters(): boolean {
    return !!(this.searchFilter.value || this.sortField);
  }

  // Get the appropriate card configuration based on type
  getCardConfig(): ColumnConfig[] {
    return this.cardConfigs[this.type] || [];
  }

  // Actions renderer for grid
  actionsRenderer(params: any) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';

    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-sm', 'btn-primary', 'me-2');
    editButton.innerHTML = '<i class="bi bi-pencil"></i>';
    editButton.addEventListener('click', () => this.onEdit(params.data));
    editButton.style.padding = '0.25rem 0.5rem';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', () => this.onDelete(params.data));
    deleteButton.style.padding = '0.25rem 0.5rem';

    container.appendChild(editButton);
    container.appendChild(deleteButton);

    return container;
  }
}
