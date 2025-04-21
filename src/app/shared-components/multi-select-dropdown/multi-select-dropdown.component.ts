import { Component, EventEmitter, Input, Output, OnInit, HostListener } from '@angular/core';

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

  ngOnInit(): void {
    // Initial emission of selections
    this.emitSelections();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = targetElement.closest('.dropdown-container');

    if (!clickedInside && this.isOpen) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  toggleOption(option: MultiSelectOption): void {
    if (!option.disabled) {
      option.selected = !option.selected;
      this.emitSelections();
    }
  }

  toggleSelectAll(): void {
    const allSelected = this.areAllSelected();
    const enabledOptions = this.options.filter(opt => !opt.disabled);

    enabledOptions.forEach(option => {
      option.selected = !allSelected;
    });

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
}
