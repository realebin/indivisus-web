import { Component, EventEmitter, Input, Output, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';

export interface MultiSelectOption {
  id: string;
  label: string;
  selected: boolean;
  disabled?: boolean;
  data?: any;
}

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss']
})
export class MultiSelectDropdownComponent implements OnInit {
  @Input() options: MultiSelectOption[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() isInvalid: boolean = false;
  @Input() invalidMessage: string = 'Please select at least one option';
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<MultiSelectOption[]>();

  isOpen: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initial emission of selections
    this.emitSelections();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Only close if the click is outside our component
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
      this.cdr.detectChanges();
    }
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      this.cdr.detectChanges();
    }
  }

  toggleOption(option: MultiSelectOption, event: MouseEvent): void {
    // Prevent all default behaviors
    event.preventDefault();
    event.stopPropagation();

    if (!option.disabled) {
      // Toggle the selected state
      option.selected = !option.selected;

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

    const allSelected = this.areAllSelected();
    const enabledOptions = this.options.filter(opt => !opt.disabled);

    enabledOptions.forEach(option => {
      option.selected = !allSelected;
    });

    // Force change detection to update the view immediately
    this.cdr.detectChanges();

    // Emit the selection change
    this.emitSelections();
  }

  areAllSelected(): boolean {
    const enabledOptions = this.options.filter(opt => !opt.disabled);
    return enabledOptions.length > 0 && enabledOptions.every(opt => opt.selected);
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

  // Handle checkbox click separately to ensure proper state update
  onCheckboxClick(option: MultiSelectOption, event: MouseEvent): void {
    this.toggleOption(option, event);
  }
}
