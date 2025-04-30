// input-builder.component.ts
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@models/_component-base.model';

@Component({
  selector: 'app-input-builder',
  templateUrl: './input-builder.component.html',
})
export class InputBuilderComponent {
  @Input() formGroup!: FormGroup;
  @Input() config!: FieldConfig;

  get control() {
    return this.formGroup.get(this.config.name);
  }

  isDisabled(): boolean {
    return this.control?.disabled || !!this.config.isDisabled;
  }

  getErrorMessage(): string {
    if (!this.control || !this.control.errors || (!this.control.touched && !this.control.dirty)) {
      return '';
    }

    // Get the first error key
    const errorKey = Object.keys(this.control.errors)[0];

    // Use custom message from config if available, otherwise provide a default
    return this.config.validationMessages?.[errorKey] || `${this.config.label} is invalid`;
  }

  isFieldInvalid(): boolean {
    return (
      this.control !== null &&
      this.control !== undefined &&
      this.control.invalid &&
      (this.control.touched || this.control.dirty)
    );
  }
}
