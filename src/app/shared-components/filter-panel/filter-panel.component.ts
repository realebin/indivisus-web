/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface SortOption {
  field: string;
  label: string;
}

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
})
export class FilterPanelComponent implements OnInit {
  @Input() title: string = 'Filter Data';
  @Input() isVisible: boolean = false;
  @Input() sortOptions: SortOption[] = [];
  @Input() searchControl!: FormControl;
  @Input() sortField: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() activeFilterText: string = '';
  @Input() resultCount: number | null = null;
  @Input() searchTerm: string = '';

  @Output() togglePanel = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<{ field: string }>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() doneFiltering = new EventEmitter<void>();

  hasActiveFilters: boolean = false;

  ngOnInit(): void {
    this.updateActiveFiltersState();
  }

  ngOnChanges(): void {
    this.updateActiveFiltersState();
  }

  updateActiveFiltersState(): void {
    this.hasActiveFilters = !!(this.searchControl?.value || this.sortField);
  }

  onTogglePanel(): void {
    this.togglePanel.emit();
  }

  onSortData(field: string): void {
    this.sortChange.emit({ field });
  }

  onResetFilters(): void {
    this.resetFilters.emit();
  }

  onDone(): void {
    this.doneFiltering.emit();
  }

  clearSearch(): void {
    if (this.searchControl) {
      this.searchControl.setValue('');
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi bi-arrow-down-up text-muted';
    }
    return this.sortDirection === 'asc'
      ? 'bi bi-sort-down'
      : 'bi bi-sort-up';
  }
}
