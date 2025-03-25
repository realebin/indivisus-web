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

  getErrorMessage(): string {
    if (!this.control?.errors || (!this.control.touched && !this.control.dirty)) {
      return '';
    }

    const errorKey = Object.keys(this.control.errors)[0];
    return this.config.validationMessages?.[errorKey] || `${this.config.label} is invalid`;
  }

  isFieldInvalid(): boolean {
    return (
      this.control?.invalid &&
      (this.control?.touched || this.control?.dirty) || false
    );
  }
}
