import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockManagementService } from '@services/stock.service';
import { BsModalRef } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-small-package-create',
  templateUrl: './small-package-create.component.html',
  styleUrls: ['./small-package-create.component.scss']
})
export class SmallPackageCreateComponent implements OnInit {
  // Will be set by the parent component when opening the modal
  packageNumber: string;

  @Output() onSaved = new EventEmitter<void>();

  form: FormGroup;
  isLoading = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private stockService: StockManagementService,
    public modalRef: BsModalRef
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      sizeAmount: [null, [Validators.required, Validators.min(0.1)]],
      sizeDescription: ['', Validators.required],
      createdBy: [localStorage.getItem('username') || 'admin', Validators.required]
    });
  }

  onSubmit(): void {
    if (!this.packageNumber) {
      this.errorMessage = 'Package number not provided';
      return;
    }

    if (this.form.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.form.value;

    this.stockService.createSmallPackage(this.packageNumber, {
      sizeAmount: formValue.sizeAmount,
      sizeDescription: formValue.sizeDescription,
      createdBy: formValue.createdBy
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.onSaved.emit();
        this.modalRef.hide();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error creating small package';
      }
    });
  }

  close(): void {
    this.modalRef.hide();
  }
}
