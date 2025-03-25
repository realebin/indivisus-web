import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockManagementService } from '@services/stock.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-big-package-create',
  templateUrl: './big-package-create.component.html',
  styleUrls: ['./big-package-create.component.scss']
})
export class BigPackageCreateComponent implements OnInit {
  @Input() stockId: string;
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
      packageNumber: [''],  // Auto-generated if empty
      sizeDescription: ['', Validators.required],
      smallPackages: this.fb.array([this.createSmallPackageFormGroup()]),
      createdBy: [localStorage.getItem('username') || 'admin', Validators.required]
    });
  }

  createSmallPackageFormGroup(): FormGroup {
    return this.fb.group({
      sizeAmount: [null, [Validators.required, Validators.min(0.1)]],
      sizeDescription: ['', Validators.required],
      createdBy: [localStorage.getItem('username') || 'admin', Validators.required]
    });
  }

  get smallPackagesFormArray(): FormArray {
    return this.form.get('smallPackages') as FormArray;
  }

  addSmallPackage(): void {
    this.smallPackagesFormArray.push(this.createSmallPackageFormGroup());
  }

  removeSmallPackage(index: number): void {
    if (this.smallPackagesFormArray.length > 1) {
      this.smallPackagesFormArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.form.value;

    this.stockService.createBigPackage(this.stockId, {
      packageNumber: formValue.packageNumber,
      sizeDescription: formValue.sizeDescription,
      smallPackages: formValue.smallPackages,
      createdBy: formValue.createdBy
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.onSaved.emit();
        this.modalRef.hide();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error creating big package';
      }
    });
  }

  close(): void {
    this.modalRef.hide();
  }
}
