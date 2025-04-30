import { Directive, forwardRef } from '@angular/core';
import {
  Validator,
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

@Directive({
  selector: `
  [appNoEmptyValidator][formControlName],
  [appNoEmptyValidator][formControl],
  [appNoEmptyValidator][ngModel],
  `,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NoEmptyValidatorDirective),
      multi: true,
    },
  ],
  standalone: true,
})
export class NoEmptyValidatorDirective implements Validator {
  constructor() { }

  validate(control: AbstractControl): ValidationErrors {
    const isMatch = /.*\S.*/.test(control.value);

    if (isMatch) {
      return {};
    }

    return {
      noEmpty: true,
    };
  }
}
