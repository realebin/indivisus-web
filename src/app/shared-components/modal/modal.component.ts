import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() title = 'Modal Title';
  @Input() confirmButtonText = 'Confirm';
  @Input() cancelButtonText = 'Cancel';
  @Input() showCancelButton: boolean = true;
  @Input() isLoading = false;
  @Input() isConfirmBtnDisabled = false;
  @Input() isFormValid: boolean = false;
  @Output() confirm = new EventEmitter<any>();

  constructor(
    public bsModalRef: BsModalRef,
    private modalService: BsModalService
  ) {} // Using BsModalRef

  onConfirm(data?: any): void {
    this.confirm.emit(data);
  }

  onClose() {
    this.modalService.hide();
  }
}
