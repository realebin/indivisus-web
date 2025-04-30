import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Action {
  type: 'edit' | 'delete' | 'view' | 'custom';
  icon: string;
  label?: string;
  buttonClass?: string;
  visible?: boolean | ((item: any) => boolean);
  id?: string;
}

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss'],
})
export class ActionButtonsComponent {
  @Input() item: any;
  @Input() actions: Action[] = [
    { type: 'edit', icon: 'bi-pencil', label: 'Edit', buttonClass: 'btn-primary' },
    { type: 'delete', icon: 'bi-trash', label: 'Delete', buttonClass: 'btn-danger' }
  ];
  @Input() showLabels: boolean = true;
  @Input() buttonSize: 'sm' | 'md' | 'lg' = 'sm';
  @Input() justifyContent: 'start' | 'center' | 'end' = 'end';

  @Output() actionClick = new EventEmitter<{ type: string, item: any, id?: string }>();

  isActionVisible(action: Action): boolean {
    if (action.visible === undefined) return true;

    if (typeof action.visible === 'function') {
      return action.visible(this.item);
    }

    return action.visible;
  }

  handleAction(action: Action): void {
    this.actionClick.emit({
      type: action.type,
      item: this.item,
      id: action.id
    });
  }
}
