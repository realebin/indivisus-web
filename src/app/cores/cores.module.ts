import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Validators from './directives/validators';

@NgModule({
  declarations: [],
  imports: [CommonModule, Validators.NoEmptyValidatorDirective],
  exports: [Validators.NoEmptyValidatorDirective],
})
export class CoresModule { }
