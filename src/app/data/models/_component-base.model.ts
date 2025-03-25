import { ValidatorFn } from '@angular/forms';
export interface ExpandableCardData {
  id: string | number;
  headerData: {
    icon?: string;
    title: string;
    value: string | number;
  };
  details: {
    label: string;
    value: string | number;
  }[];
  isExpanded?: boolean;
}



export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  isDisabled?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validators?: ValidatorFn[];
  validationMessages?: { [key: string]: string };
}
