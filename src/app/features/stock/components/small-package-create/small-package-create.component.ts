import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockManagementService } from '@services/stock.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { SmallPackageModel } from '@models/stock.model';


@Component({
  selector: 'app-small-package-create',
  templateUrl: './small-package-create.component.html',
  styleUrls: ['./small-package-create.component.scss']
})
export class SmallPackageCreateComponent implements OnInit {
  // Will be set through initialState when opening the modal
  @Input() packageNumber: string;

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
      multiplier: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
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

    // Process multiple small packages based on multiplier
    const multiplier = parseInt(formValue.multiplier) || 1;
    const smallPackageRequests: Observable<SmallPackageModel>[] = [];

    // Create requests based on multiplier
    for (let i = 0; i < multiplier; i++) {
      smallPackageRequests.push(
        this.stockService.createSmallPackage(this.packageNumber, {
          sizeAmount: formValue.sizeAmount,
          sizeDescription: formValue.sizeDescription,
          createdBy: formValue.createdBy
        })
      );
    }

    // Handle all requests sequentially
    const processRequests = (index = 0) => {
      if (index >= smallPackageRequests.length) {
        // All requests completed successfully
        this.isLoading = false;
        this.onSaved.emit();
        this.modalRef.hide();
        return;
      }

      smallPackageRequests[index].subscribe({
        next: () => {
          // Process next request
          processRequests(index + 1);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || `Error creating small package ${index + 1}`;
        }
      });
    };

    // Start processing requests
    processRequests();
  }

  close(): void {
    this.modalRef.hide();
  }
}
