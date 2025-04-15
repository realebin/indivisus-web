// src/app/shared-components/multi-select-dropdown/multi-select-dropdown.component.ts
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
  template: `
    <div class="dropdown-container position-relative">
      <div class="form-control d-flex justify-content-between align-items-center"
           [class.is-invalid]="isInvalid"
           [class.disabled]="disabled"
           (click)="toggleDropdown()">
        <div class="selected-text">
          <span *ngIf="!hasSelectedOptions()">{{ placeholder }}</span>
          <span *ngIf="hasSelectedOptions()">
            {{ getSelectedCount() }} {{ getSelectedCount() === 1 ? 'item' : 'items' }} selected
          </span>
        </div>
        <i class="bi" [ngClass]="isOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
      </div>

      <div class="dropdown-menu w-100" [class.show]="isOpen">
        <div class="p-2 border-bottom">
          <div class="form-check">
            <input class="form-check-input" type="checkbox"
                  [checked]="areAllSelected()"
                  [indeterminate]="hasSelectedOptions() && !areAllSelected()"
                  (change)="toggleSelectAll()"
                  id="selectAll">
            <label class="form-check-label" for="selectAll">
              Select All
            </label>
          </div>
        </div>
        <div class="dropdown-options py-1">
          <div *ngFor="let option of options; let i = index" class="dropdown-item p-0">
            <div class="form-check py-2 px-3">
              <input class="form-check-input" type="checkbox"
                    [id]="'option-' + i"
                    [checked]="option.selected"
                    [disabled]="option.disabled"
                    (change)="toggleOption(option)">
              <label class="form-check-label" [for]="'option-' + i" [title]="option.label">
                {{ option.label }}
              </label>
            </div>
          </div>
          <div *ngIf="options.length === 0" class="p-3 text-muted">
            No options available
          </div>
        </div>
      </div>

      <div *ngIf="isInvalid" class="invalid-feedback">
        {{ invalidMessage }}
      </div>
    </div>
  `,
  styles: [`
    .dropdown-container {
      position: relative;
    }
    .form-control {
      cursor: pointer;
      user-select: none;
      min-height: 38px;
    }
    .form-control.disabled {
      background-color: #e9ecef;
      opacity: 1;
      pointer-events: none;
    }
    .selected-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(100% - 20px);
    }
    .dropdown-menu {
      max-height: 250px;
      overflow-y: auto;
    }
    .dropdown-options {
      max-height: 200px;
      overflow-y: auto;
    }
    .form-check-label {
      width: 100%;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
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
