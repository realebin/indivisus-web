import { 
  Component, 
  EventEmitter, 
  Input, 
  Output, 
  OnInit, 
  OnChanges, 
  SimpleChanges, 
  ElementRef, 
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
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
export class MultiSelectDropdownComponent implements OnInit, OnChanges, OnDestroy {
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
  ) {}

  ngOnInit(): void {
    console.log('🔵 MultiSelect: Component initialized');
    this.initializeOptions();

    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.applySearch(searchTerm || '');
    });

    // Add document click listener for debugging
    document.addEventListener('click', (event: Event) => {
      if (this.isOpen) {
        const isClickInside = this.elementRef.nativeElement.contains(event.target);
        console.log('📍 Document click:', {
          isClickInside: isClickInside,
          target: event.target,
          dropdownWasOpen: this.isOpen
        });
        
        if (!isClickInside) {
          console.log('⛔ Closing dropdown due to outside click');
          this.isOpen = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.initializeOptions();
    }
  }

  ngOnDestroy(): void {
    console.log('🔴 MultiSelect: Component destroyed');
  }

  private initializeOptions(): void {
    this.filteredOptions = this.options.map(option => ({ ...option }));
    this.updateSelectAllState();
    this.cdr.detectChanges();
  }

  private applySearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredOptions = this.options.map(option => ({ ...option }));
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredOptions = this.options
        .filter(option => option.label.toLowerCase().includes(term))
        .map(option => ({ ...option }));
    }
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

  // Let's see when this gets called
  toggleDropdown(event?: Event): void {
    console.log('🟢 MultiSelect: toggleDropdown called', {
      currentState: this.isOpen,
      event: event?.type,
      target: event?.target
    });

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      console.log('🟡 MultiSelect: isOpen changed to:', this.isOpen);

      if (this.isOpen && this.allowSearch) {
        this.searchControl.setValue('', { emitEvent: false });
        this.applySearch('');
      }

      this.cdr.detectChanges();
    }
  }

  // This is our main test - let's see if this gets called and if the dropdown stays open
  selectOption(option: MultiSelectOption, event?: Event): void {
    console.log('🟠 MultiSelect: selectOption called', {
      optionId: option.id,
      currentSelected: option.selected,
      dropdownOpen: this.isOpen,
      event: event?.type
    });

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!option.disabled) {
      const originalOption = this.options.find(opt => opt.id === option.id);
      if (originalOption) {
        originalOption.selected = !originalOption.selected;
        option.selected = originalOption.selected;
        
        console.log('🟣 MultiSelect: Option toggled', {
          optionId: option.id,
          newSelected: option.selected,
          dropdownStillOpen: this.isOpen
        });
      }

      this.updateSelectAllState();
      this.cdr.detectChanges();
      this.emitSelections();

      // Check if dropdown is still open after all this
      setTimeout(() => {
        console.log('🔵 MultiSelect: After timeout, dropdown is:', this.isOpen);
      }, 0);
    }
  }

  toggleSelectAll(event?: Event): void {
    console.log('🟤 MultiSelect: toggleSelectAll called');
    
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const newSelectedState = this.selectAllState !== 'checked';
    const enabledFilteredOptions = this.filteredOptions.filter(opt => !opt.disabled);

    enabledFilteredOptions.forEach(filteredOption => {
      const originalOption = this.options.find(opt => opt.id === filteredOption.id);
      if (originalOption) {
        originalOption.selected = newSelectedState;
        filteredOption.selected = newSelectedState;
      }
    });

    this.selectAllState = newSelectedState ? 'checked' : 'unchecked';
    this.cdr.detectChanges();
    this.emitSelections();
  }

  // Let's also add a simple outside click detector
  onOutsideClick(event: Event): void {
    console.log('⭕ MultiSelect: Outside click detected', {
      dropdownOpen: this.isOpen,
      target: event.target
    });

    if (this.isOpen) {
      this.isOpen = false;
      console.log('⭕ MultiSelect: Dropdown closed by outside click');
      this.cdr.detectChanges();
    }
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