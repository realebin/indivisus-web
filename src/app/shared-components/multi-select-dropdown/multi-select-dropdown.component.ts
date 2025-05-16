import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface MultiSelectOption {
  id: string;
  label: string;
  selected: boolean;
  disabled?: boolean;
  data?: any;
  quantity?: number;
  sizeAmount?: number;
}

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss']
})
export class MultiSelectDropdownComponent implements OnInit, OnChanges {
  @Input() options: MultiSelectOption[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() isInvalid: boolean = false;
  @Input() invalidMessage: string = 'Please select at least one option';
  @Input() disabled: boolean = false;
  @Input() allowSearch: boolean = true;

  @Output() selectionChange = new EventEmitter<MultiSelectOption[]>();

  filteredOptions: MultiSelectOption[] = [];
  isOpen: boolean = false;
  selectAllState: 'checked' | 'unchecked' | 'indeterminate' = 'unchecked';
  searchControl = new FormControl('');

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeOptions();

    // Listen for search input changes
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.applySearch(searchTerm || '');
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.initializeOptions();
    }
  }

  private initializeOptions(): void {
    // Create a working copy of options
    this.filteredOptions = this.options.map(option => ({ ...option }));
    
    // Update select all state
    this.updateSelectAllState();
    
    // Apply search if there's a search term
    if (this.searchControl.value) {
      this.applySearch(this.searchControl.value);
    }
    
    // Force change detection
    this.cdr.detectChanges();
  }

  private applySearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      // If search is empty, show all options
      this.filteredOptions = this.options.map(option => ({ ...option }));
    } else {
      // Apply search filter
      const term = searchTerm.toLowerCase().trim();
      this.filteredOptions = this.options
        .filter(option => option.label.toLowerCase().includes(term))
        .map(option => ({ ...option }));
    }

    // Update select all state after search
    this.updateSelectAllState();
    this.cdr.detectChanges();
  }

  private updateSelectAllState(): void {
    const enabledOptions = this.filteredOptions.filter(opt => !opt.disabled);
    const selectedOptions = enabledOptions.filter(opt => opt.selected);

    if (selectedOptions.length === 0) {
      this.selectAllState = 'unchecked';
    } else if (selectedOptions.length === enabledOptions.length) {
      this.selectAllState = 'checked';
    } else {
      this.selectAllState = 'indeterminate';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Only close if the click is outside our component
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
      this.cdr.detectChanges();
    }
  }

  toggleDropdown(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.disabled) {
      this.isOpen = !this.isOpen;

      // Clear search when opening dropdown
      if (this.isOpen && this.allowSearch) {
        this.searchControl.setValue('', { emitEvent: false });
        this.applySearch('');
      }

      this.cdr.detectChanges();
    }
  }

  toggleOption(option: MultiSelectOption): void {
    if (!option.disabled) {
      // Find the original option in the main options array and toggle it
      const originalOption = this.options.find(opt => opt.id === option.id);
      if (originalOption) {
        originalOption.selected = !originalOption.selected;
        
        // Update the filtered option as well
        option.selected = originalOption.selected;
      }

      // Update select all state after toggling
      this.updateSelectAllState();

      // Force change detection
      this.cdr.detectChanges();

      // Emit the selection change
      this.emitSelections();
    }
  }

  toggleSelectAll(event: MouseEvent): void {
    // Prevent all default behaviors
    event.preventDefault();
    event.stopPropagation();

    // Determine new state based on current state
    const newSelectedState = this.selectAllState !== 'checked';

    // Select or deselect all enabled options in both arrays
    const enabledFilteredOptions = this.filteredOptions.filter(opt => !opt.disabled);
    
    // Update both the filtered options and the original options
    enabledFilteredOptions.forEach(filteredOption => {
      const originalOption = this.options.find(opt => opt.id === filteredOption.id);
      if (originalOption) {
        originalOption.selected = newSelectedState;
        filteredOption.selected = newSelectedState;
      }
    });

    // Manually set the select all state
    this.selectAllState = newSelectedState ? 'checked' : 'unchecked';

    // Force change detection
    this.cdr.detectChanges();

    // Emit the selection change
    this.emitSelections();
  }

  hasSelectedOptions(): boolean {
    return this.options.some(opt => opt.selected);
  }

  getSelectedCount(): number {
    return this.options.filter(opt => opt.selected).length;
  }

  getSelectedOptions(): MultiSelectOption[] {
    return this.options.filter(opt => opt.selected);
  }

  emitSelections(): void {
    this.selectionChange.emit(this.getSelectedOptions());
  }

  // Handle checkbox interaction with improved event handling
  handleOptionInteraction(option: MultiSelectOption, event: MouseEvent): void {
    // Prevent default behavior but don't stop propagation completely
    event.preventDefault();

    // Toggle option directly
    this.toggleOption(option);
  }

  // Clear search input
  clearSearch(event: Event): void {
    event.stopPropagation();
    this.searchControl.setValue('', { emitEvent: true });
  }

  // Stop propagation for search input clicks
  onSearchInputClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}