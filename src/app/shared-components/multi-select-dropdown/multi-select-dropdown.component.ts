import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';

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

  @Output() selectionChange = new EventEmitter<MultiSelectOption[]>();

  filteredOptions: MultiSelectOption[] = [];
  isOpen: boolean = false;
  selectAllState: 'checked' | 'unchecked' | 'indeterminate' = 'unchecked';

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filterOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filterOptions();
    }
  }

  filterOptions(): void {
    // More robust filtering with multiple checks
    this.filteredOptions = this.options.filter(option => {
      // Check multiple possible ways to determine if the option should be shown
      const sizeAmount = 
        option.sizeAmount ?? 
        option.quantity ?? 
        (option.data && (option.data.sizeAmount || option.data.quantity)) ?? 
        0;

      // Keep options with size/quantity > 0
      return sizeAmount > 0;
    });

    // If no options pass the filter, fall back to original options
    if (this.filteredOptions.length === 0) {
      this.filteredOptions = this.options;
    }

    // Update select all state after filtering
    this.updateSelectAllState();

    // Initial emission of selections
    this.emitSelections();
    
    // Force change detection
    this.cdr.detectChanges();
  }

  updateSelectAllState(): void {
    const enabledOptions = this.filteredOptions.filter(opt => !opt.disabled);
    const selectedOptions = enabledOptions.filter(opt => opt.selected);

    console.log('Enabled options:', enabledOptions.length);
    console.log('Selected options:', selectedOptions.length);

    if (selectedOptions.length === 0) {
      this.selectAllState = 'unchecked';
    } else if (selectedOptions.length === enabledOptions.length) {
      this.selectAllState = 'checked';
    } else {
      this.selectAllState = 'indeterminate';
    }

    console.log('Select all state:', this.selectAllState);
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
      this.cdr.detectChanges();
    }
  }

  toggleOption(option: MultiSelectOption): void {
    if (!option.disabled) {
      // Toggle the selected state
      option.selected = !option.selected;

      // Update select all state after toggling
      this.updateSelectAllState();

      // Force change detection to update the view immediately
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

    // Select or deselect all enabled options
    const enabledOptions = this.filteredOptions.filter(opt => !opt.disabled);
    enabledOptions.forEach(option => {
      option.selected = newSelectedState;
    });

    // Manually set the select all state
    this.selectAllState = newSelectedState ? 'checked' : 'unchecked';

    console.log('Select all clicked. New state:', this.selectAllState);

    // Force change detection to update the view immediately
    this.cdr.detectChanges();

    // Emit the selection change
    this.emitSelections();
  }

  hasSelectedOptions(): boolean {
    return this.filteredOptions.some(opt => opt.selected);
  }

  getSelectedCount(): number {
    return this.filteredOptions.filter(opt => opt.selected).length;
  }

  getSelectedOptions(): MultiSelectOption[] {
    return this.filteredOptions.filter(opt => opt.selected);
  }

  emitSelections(): void {
    this.selectionChange.emit(this.getSelectedOptions());
  }

  // Handle checkbox interaction
  handleOptionInteraction(option: MultiSelectOption, event: MouseEvent): void {
    // Crucial part: Prevent default and stop propagation, 
    // but WITHOUT using methods that might trigger scrolling
    event.preventDefault();
    
    // Use a microtask to toggle to avoid potential scroll behavior
    Promise.resolve().then(() => {
      this.toggleOption(option);
    });
  }
}