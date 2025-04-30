// modal.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title = 'Modal Title';
  @Input() confirmButtonText = 'Confirm';
  @Input() cancelButtonText = 'Cancel';
  @Input() isLoading = false;
  @Input() isFormValid = true;
  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('contentContainer', { read: ViewContainerRef, static: true })
  contentContainer: ViewContainerRef;

  content: ComponentRef<any> | null = null;

  constructor() { }

  ngAfterViewInit() {
    // If content component was set, attach it to the container
    if (this.content && this.contentContainer) {
      this.contentContainer.insert(this.content.hostView);
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
